import { UseGuards, applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
