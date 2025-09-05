import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class AppController {
  @SkipThrottle()
  @Get('/health')
  getHealth() {
    return { status: 'API is running', timestamp: new Date().toISOString() };
  }
}
