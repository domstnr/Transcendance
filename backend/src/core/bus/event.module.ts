// src/core/bus/event.module.ts
import { Global, Module } from '@nestjs/common';
import { EventBus } from './event.service';

@Global() // <--- TRÈS IMPORTANT
@Module({
  providers: [EventBus],
  exports: [EventBus], // <--- IL DOIT ÊTRE EXPORTÉ
})
export class EventModule {}