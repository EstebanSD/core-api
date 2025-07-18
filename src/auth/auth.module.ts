import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/common/users';
import { AppConfigModule, AppConfigService } from 'src/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';

@Module({
  imports: [
    AppConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
      }),
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, CustomLoggerService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
