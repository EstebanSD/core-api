import { UseGuards, applyDecorators } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../guards';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard));
}
