import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument, UserService } from 'src/common/users';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { JwtPayload } from './types';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  async register(body: RegisterDto): Promise<{ access_token: string }> {
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = await this.usersService.create({
      email: body.email,
      passwordHash,
      fullName: body.fullName,
    });

    const tokens = await this.generateTokens(user);

    // Save refresh token in to DB
    await this.saveRefreshToken(user._id.toString(), tokens.refresh_token);

    return tokens;
  }

  async validateUser(body: { email: string; password: string }): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!passwordValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user.toObject();

    return result as UserDocument;
  }

  async login(user: UserDocument) {
    const tokens = await this.generateTokens(user);

    // Save the refresh token in the DB
    await this.saveRefreshToken(user._id.toString(), tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  private async generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      // Verify if the refresh token exists in the DB
      const user = await this.usersService.findById(decoded.sub);
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update the refresh token in the DB
      await this.saveRefreshToken(user._id.toString(), tokens.refresh_token);

      return tokens;
    } catch (error) {
      this.logger.error('Error refreshing token', error, 'AuthService');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // Remove the refresh token from the DB
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    await this.usersService.updateRefreshToken(userId, refreshToken);
  }
}
