import { IsUUID } from 'class-validator';

export class FriendParamDto {
    @IsUUID()
    userId: string;
}
