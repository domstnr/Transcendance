import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException 
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { generateHash, verifyHash } from "./utils/argon2.util";
import { EventBus } from "../../core/bus/event.service";
import { EventType } from "../../core/bus/event.types";
import { UserService } from "../user/user.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly eventBus: EventBus,
        private readonly jwtService: JwtService,
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

        const tokens = await this.generateTokens(user.id, user.username);
        return {
            status: 'success',
            message: 'Login success.',
            user: {
                userId: user.id,
                username: user.username
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
