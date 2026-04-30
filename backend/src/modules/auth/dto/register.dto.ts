import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";


export class    RegisterDto {
    @IsEmail({}, { message: 'email adress must be valid'})
    email!: string;

    @IsString()
    @MinLength(8, { message: 'password must be at least 8 characters.'})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,{
        message: 'password too weak( must contain: Uppercase, lowercase, number, special character).',
    })
    password!:  string;

    @IsString()
    @IsNotEmpty({ message: 'username requested.'})
    username!:  string;
}