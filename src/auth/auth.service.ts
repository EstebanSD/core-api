import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument, UserService } from 'src/common/users';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
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

    const payload = { sub: user._id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
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

  login(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
