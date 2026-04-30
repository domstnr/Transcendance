import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'email must be valid.' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password required.' })
    password!: string;
}