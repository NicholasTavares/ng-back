import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  @Inject(UsersService)
  private readonly usersService: UsersService;

  async login(user) {
    const payload = { sub: user.id, username: user.username };

    return {
      jwt: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findUserByUsernameForAuth(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = compareSync(password, user.password);

    if (!isPasswordValid) return null;

    return user;
  }
}
