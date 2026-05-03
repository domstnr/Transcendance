import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { PasswordService } from "./password.service";
import { LoginDto } from "./dto/login.dto";
import { TokenService } from "./token.service";

/* -------------------------------------------------------------------------- */
/*                                login class,                                */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                         check if email is in prisma                        */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*             check if password is same from our hashed password             */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        private readonly userService: UserService,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) {}

    async execute(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userService.findByEmail(email);

        if (!user) {
            this.logger.warn(`Connection failed: email not found ${email}`);
            throw new UnauthorizedException('Id invalid.');
        }

        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Connection failed: password invalid for (${email})`);
            throw new UnauthorizedException('Id invalid.');
        }

        this.logger.log(`Connection success via HTTPS for: ${user.username}`);
        
        //putting id & username in case
        const tokens = await this.tokenService.generateTokens(user.id, user.username);
        //TO BE DONE
        //to be put in cookie later 
        return {
            status: 'success',
            message: 'Login success. Waiting for JWT',
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
}
