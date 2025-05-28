import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  getHealth() {
    return { status: 'API is running', timestamp: new Date().toISOString() };
  }
}
