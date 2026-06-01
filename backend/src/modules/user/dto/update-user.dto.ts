import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'username cannot be empty.' })
    username?: string;
}
