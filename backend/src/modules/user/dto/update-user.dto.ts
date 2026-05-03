import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'username cannot be empty.' })
    username?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'email cannot be empty.' })
    @IsEmail({}, { message: 'email adress must be valid' })
    email?: string;
}
