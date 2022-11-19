import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserDataDto } from './dto/user-data.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'criticalGuard') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        request => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  // db 참조 하는 guard
  async validate(payload: UserDataDto): Promise<boolean> {
    const user: User = await this.userService.findUser(payload);

    if (!user) {
      throw new UnauthorizedException(
        '서버에 해당 유저가 존재하지 않습니다. 가입을 완료해주세요.'
      );
    }
    return true;
  }
}

@Injectable()
export class JwtStrategy2 extends PassportStrategy(Strategy, 'looseGuard') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        request => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  // db 참조 하지 않는 guard
  async validate(): Promise<boolean> {
    return true;
  }
}
