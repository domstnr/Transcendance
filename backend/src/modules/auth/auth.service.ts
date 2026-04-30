import { Injectable, Logger } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { EventBus } from "../../core/bus/event.service";
import { RegisterDto } from "./dto/register.dto";
import { EventType } from "../../core/bus/event.types";
import { UserService } from "./user.service";


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly passwordService: PasswordService,
        private readonly eventBus: EventBus,
    ){}

    async register(dto: RegisterDto) {

        await this.userService.checkUserExists(dto.email, dto.username);
/*hash*/const hashedPassword = await this.passwordService.hashPassword(dto.password);
        const newUser = await this.userService.createUser(dto.email, dto.username, hashedPassword);


        await this.eventBus.publish({
            type: EventType.USER_REGISTERED,
            timestamp: Date.now(),
            payload: { userId: newUser.id, email: newUser.email, username: newUser.username},
        })

        return { message: 'Registration successful', userId: newUser.id};
    }

    async deleteAccount(userId: string) {
        const deletedUser = await this.userService.deleteUser(userId);

        this.logger.log(`Account deleted: ${deletedUser.username}`);

        return Promise.resolve({
            status: 'success',
            message: 'Your account has been deleted',
        });
    }
}