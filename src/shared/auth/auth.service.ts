import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async validateSuperUser(email: string, pass: string) {
    const user = await this.prisma.superUser.findFirst({ where: { email } });
    if (user && (await this.comparePassword(pass, user.password))) {
      return await this.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'admin',
      });
    }
    throw "Error, couldn't find the user";
  }

  async validateUserByEmail(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    const validPassword= await this.comparePassword(pass, user.password);
    if (user &&validPassword ) {
      return await this.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'user',
      });
    }
    
    throw new Error("Error, couldn't find the user");
  }
  

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
