import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'src/auth/types';

export const User = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
