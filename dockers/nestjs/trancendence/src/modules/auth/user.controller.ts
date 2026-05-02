import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "./strategies/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";


@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, callback) => {
                // we create a unique name: id_date.extension
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                const filename = `${(req as any).user.userId}-${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
        //security measure: only images
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\(jpg|jpeg|png|gif)$/)) {
                return callback(new BadRequestException(`Only image permitted !`));
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 //5mo max
        }
    }))
    uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: RequestWithUser //TODO
    )
    {
    if (!file) {
      throw new BadRequestException('Aucun fichier envoyé');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // TODO: Utiliser this.userService pour mettre à jour l'utilisateur dans ta base de données Prisma
    // await this.userService.updateAvatar(req.user.userId, avatarUrl);

    return { 
        message: 'Avatar mis à jour avec succès !',
        avatarUrl: avatarUrl
    };
  }
}