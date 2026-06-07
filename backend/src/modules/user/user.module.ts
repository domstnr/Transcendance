import { Module } from "@nestjs/common";
import { PrismaModule } from "../../shared/prisma/prisma.module";
import { ApiKeyModule } from "../api_key/api-key.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    imports: [PrismaModule, ApiKeyModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
