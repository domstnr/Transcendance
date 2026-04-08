import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuctionModule } from './auction/auction.module';
import { BidsModule } from './bids/bids.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, UsersModule, AuctionModule, BidsModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
