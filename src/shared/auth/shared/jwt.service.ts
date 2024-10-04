import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JWTService {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async createRefreshToken(payload: { email: string; userId: string; role: 'user' | 'admin'; }) {
        return await this.jwtService.signAsync(payload, {
            secret: jwtConstants.secret,
            expiresIn: '7d',
        });
    }

    async createAccessToken(payload: { email: string; userId: string; role: 'user' | 'admin'; }) {
        return this.jwtService.signAsync(payload, {
            secret: jwtConstants.secret,
            expiresIn: '1d',
        });
    }

    decodeRefreshToken(token: string) {
        return this.jwtService.decode(token);
    }

}
