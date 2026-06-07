import { IsString, IsNotEmpty } from "class-validator";

export class GitHubCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
