import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemPublicAPIController } from './item-public-api.controller';
import { ItemService } from './item.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuctionModule } from '../auction/auction.module';

@Module({
  imports: [PrismaModule, AuctionModule],
  controllers: [ItemController, ItemPublicAPIController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
