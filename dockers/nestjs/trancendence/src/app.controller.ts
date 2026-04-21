/*import { Controller, OnModuleInit } from '@nestjs/common';
import { EventBus } from './core/bus/event.service';
@Controller()
export class AppController implements OnModuleInit {
  constructor(private readonly eventBus: EventBus) {}

  onModuleInit() {
      console.log('---Test du bus---');
      this.eventBus.dispatch({
        name: 'Test Startup',
        type: 'DEBUG',
        message: 'Vérification du bus',
        payload: { status: 'ok' },
        timestamp: Date.now(),
        });
  }
}
*/