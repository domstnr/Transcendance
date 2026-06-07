import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { generateHash, verifyHash } from "./utils/argon2.util";
import { EventBus } from "../../core/bus/event.service";
import { EventType } from "../../core/bus/event.types";
import { UserService } from "../user/user.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { GitHubCodeDto } from "./dto/github-code.dto";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TwoFactorService } from './two-factor.service';


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly eventBus: EventBus,
        private readonly jwtService: JwtService,
        private configService: ConfigService,
        private httpService: HttpService,
        private readonly twoFactorService: TwoFactorService,
    ){}

    async register(dto: RegisterDto) {
        await this.userService.checkUserExists(dto.email, dto.username);
        const hashedPassword = await this.hashPassword(dto.password);
        const newUser = await this.userService.createUser(dto.email, dto.username, hashedPassword);

        await this.eventBus.publish({
            type: EventType.USER_REGISTERED,
            timestamp: Date.now(),
            payload: { userId: newUser.id, email: newUser.email, username: newUser.username},
        })

        return { message: 'Registration successful', userId: newUser.id};
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            this.logger.warn(`Connection failed: email not found ${email}`);
            throw new UnauthorizedException('Invalid email or password.');
        }

        const isPasswordValid = await this.comparePassword(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Connection failed: password invalid for (${email})`);
            throw new UnauthorizedException('Invalid email or password.');
        }

        this.logger.log(`Connection success via HTTPS for: ${user.username}`);

        if (user.twoFactorEnabled) {
            const tempToken = await this.jwtService.signAsync(
                {
                    sub: user.id,
                    username: user.username,
                    tokenType: '2fa',
                },
                { expiresIn: '5m' },
            );

            return {
                status: '2fa_required',
                message: 'Two-factor authentication required.',
                tempToken,
            };
        }

        const tokens = await this.generateTokens(user.id, user.username);
        return {
            status: 'success',
            message: 'Login success.',
            user: {
                userId: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl ?? null,
                twoFactorEnabled: user.twoFactorEnabled,
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }
        };
    }

    async refresh(refreshToken?: string) {
        if (!refreshToken) {
            this.logger.warn(`Refresh Failed... Token missing`);
            throw new UnauthorizedException('Expired session, refresh');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
            if (payload.tokenType !== 'refresh') {
                this.logger.warn('Refresh failed: non-refresh token used on refresh endpoint');
                throw new UnauthorizedException('Expired session, refresh');
            }
            const tokens = await this.generateTokens(payload.sub, payload.username);
            this.logger.log(`Tokens found for user : ${payload.sub}`);
            return {
                status: 'success',
                message: 'Tokens refreshed with success',
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                }
            };
        } catch (err) {
            console.log(err);
            this.logger.warn(`Refresh Failed... Token invalid or expired`);
            throw new UnauthorizedException('Expired session, refresh');
        }
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.userService.findByIdWithPassword(userId);

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const isCurrentPasswordValid = await this.comparePassword(
            dto.currentPassword,
            user.password,
        );
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Invalid current password.');
        }

        const isSamePassword = await this.comparePassword(
            dto.newPassword,
            user.password,
        );
        if (isSamePassword) {
            throw new BadRequestException('New password must be different from the current password.');
        }

        const hashedPassword = await this.hashPassword(dto.newPassword);
        await this.userService.updatePassword(userId, hashedPassword);

        return { message: 'Password updated successfully.' };
    }

    async handleGitHubCode(codeDto: GitHubCodeDto): Promise<{ username: string; email: string }>
    {
        const { code } = codeDto;
        const accessToken = await this.exchangeCodeForToken(code);
        if (accessToken == undefined)
            throw new BadRequestException('Failed to exchange GitHub code for access token.');
        const user = await this.fetchGitHubUser(accessToken);
        const email = await this.fetchGitHubUserEmail(accessToken);
        return {username: user, email: email };
    }

    async findOrCreateGitHubUser(email: string, username: string) {
        let user = await this.userService.findByEmail(email);
        if (!user) {
            const randomHash = await this.hashPassword(`${Date.now()}_${Math.random()}`);
            let finalUsername = username;
            try {
                await this.userService.checkUserExists(email, finalUsername);
            } catch {
                finalUsername = `${username}_gh`;
            }
            const newUser = await this.userService.createUser(email, finalUsername, randomHash);
            await this.eventBus.publish({
                type: EventType.USER_REGISTERED,
                timestamp: Date.now(),
                payload: { userId: newUser.id, email: newUser.email, username: newUser.username },
            });
            user = await this.userService.findByEmail(email);
        }
        const tokens = await this.generateTokens(user!.id, user!.username);
        return {
            status: 'success' as const,
            message: 'Login successful.',
            user: {
                userId: user!.id,
                username: user!.username,
                avatarUrl: user!.avatarUrl ?? null,
                twoFactorEnabled: user!.twoFactorEnabled,
            },
            tokens,
        };
    }

    private async exchangeCodeForToken(code: string): Promise<string> {
        const clientId = this.configService.get<string>('VITE_GITHUB_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GITHUB_SECRET');

        const response = await firstValueFrom(
            this.httpService.post('https://github.com/login/oauth/access_token', {
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }, 
            {
                headers: {
                        Accept: 'application/json',
                },
            }),
        );
        return response.data.access_token;
    }

    private async fetchGitHubUser(accessToken: string): Promise<string> {
        const response = await firstValueFrom(
            this.httpService.get('https://api.github.com/user', {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${accessToken}`,
                    'X-GitHub-Api-Version':'2026-03-10',
                    'User-Agent': 'Transauction-App',
                },
            }),
        );
        return response.data.login;
    }

    private async fetchGitHubUserEmail(accessToken: string): Promise<string> {
        const response = await firstValueFrom(
            this.httpService.get('https://api.github.com/user/emails', {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${accessToken}`,
                    'X-GitHub-Api-Version':'2026-03-10',
                    'User-Agent': 'Transauction-App',
                },
            }),
        );
        const primaryEmail = response.data.find((e: any) => e.primary)?.email;
        return primaryEmail || response.data[0]?.email;
    }

    async setupTwoFactor(userId: string) {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        return this.twoFactorService.generateSetup(user.id, user.email);
    }

    async enableTwoFactor(userId: string, code: string) {
        const user = await this.userService.findByIdWithTwoFactor(userId);

        if (!user?.twoFactorSecret) {
            throw new BadRequestException('2FA setup not initialized.');
        }

        return this.twoFactorService.enable(userId, user.twoFactorSecret, code);
    }

    async disableTwoFactor(userId: string) {
        await this.userService.disableTwoFactor(userId);
        return { message: '2FA disabled successfully.' };
    }

    async verifyTwoFactorLogin(tempToken: string, code: string) {
        let payload: JwtPayload;

        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(tempToken);
        } catch {
            throw new UnauthorizedException('Invalid or expired 2FA session.');
        }

        if (payload.tokenType !== '2fa') {
            throw new UnauthorizedException('Invalid 2FA session.');
        }

        const user = await this.userService.findByIdWithTwoFactor(payload.sub);

        if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
            throw new UnauthorizedException('2FA is not enabled.');
        }

        const isValid = this.twoFactorService.verifyCode(user.twoFactorSecret, code);

        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code.');
        }

        const tokens = await this.generateTokens(user.id, user.username);

        return {
            status: 'success',
            message: 'Login success.',
            user: {
                userId: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl ?? null,
                twoFactorEnabled: user.twoFactorEnabled,
            },
            tokens,
        };
    }

    private async generateTokens(userId: string, username: string) {
        const accessPayload: JwtPayload = {
            sub: userId,
            username,
            tokenType: 'access',
        };
        const refreshPayload: JwtPayload = {
            sub: userId,
            username,
            tokenType: 'refresh',
        };

        const accessToken = await this.jwtService.signAsync(accessPayload);
        const refreshToken = await this.jwtService.signAsync(refreshPayload, {
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private async hashPassword(password: string): Promise<string> {
        return generateHash(password);
    }

    private async comparePassword(plainText: string, hash: string): Promise<boolean> {
        return verifyHash(plainText, hash);
    }
}
