import { IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    currentPassword!: string;

    @IsString()
    @MinLength(8, { message: 'password must be at least 8 characters.'})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,{
        message: 'password too weak( must contain: Uppercase, lowercase, number, special character).',
    })
    newPassword!: string;
}
