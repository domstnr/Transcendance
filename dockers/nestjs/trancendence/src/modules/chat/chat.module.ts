import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { PrismaService } from '../../prisma.service'; // Ajuste le chemin
import { ChatController } from './chat.controller';
import { AuthnModule } from '../auth/auth.module';

@Module({
  imports: [AuthnModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, PrismaService],
})
export class ChatModule {}