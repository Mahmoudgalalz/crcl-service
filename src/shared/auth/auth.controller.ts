import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
  Res,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SuccessResponse } from 'src/common/success.response';
import { Public, Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { Role } from '../interface/roles';
import { OTPService } from './shared/otp.service';
import { NumberDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { Request, Response } from 'express';
import { checkUserExists } from 'src/services/oauth/oauth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OTPService,
  ) {}

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async superUserLogin(@Body() loginDto: LoginAdminDto, @Res() res: Response) {
    try {
      const payload = await this.authService.validateSuperUser(
        loginDto.email,
        loginDto.password,
      );
      if (payload.access_token) {
        res.cookie('refreshToken', payload.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          domain:
            process.env.NODE_ENV !== 'development'
              ? process.env.domain
              : 'localhost',
        });
        res.status(HttpStatus.ACCEPTED).send({
          status: 'success',
          message: 'Tokens',
          data: {
            access_token: payload.access_token,
            type: payload.type,
          },
        });
        return;
      }
      res.status(HttpStatus.NOT_FOUND).send({
        status: 'error',
        message: "Couldn't find the user",
        data: {},
      });
      return;
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Post('admin/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  async superUserVerify(@Req() req: Request, @Res() res: Response) {
    try {
      const token = req.cookies['refreshToken'];
      if (token) {
        const { refresh_token, access_token } =
          await this.authService.validateSuperUserByRefresh(token);
        res.cookie('refreshToken', refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          domain:
            process.env.NODE_ENV !== 'development'
              ? process.env.domain
              : 'localhost',
        });
        res
          .send({
            status: 'success',
            message: 'Tokens',
            data: {
              access_token,
            },
          })
          .status(HttpStatus.ACCEPTED);
        return;
      }
      res
        .send({
          status: 'error',
          message: "Refresh token isn't provided within the cookies",
          data: {},
        })
        .status(HttpStatus.ACCEPTED);
      return;
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Public()
  @Post('user/login')
  async userLogin(
    @Body() loginDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const { access_token, refresh_token, extra } =
        await this.authService.validateUserByEmail(
          loginDto.email,
          loginDto.password,
        );
      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        domain:
          process.env.NODE_ENV !== 'development'
            ? process.env.domain
            : 'localhost',
      });
      res
        .send({
          status: 'success',
          message: 'Tokens',
          data: {
            access_token,
            ...extra,
          },
        })
        .status(HttpStatus.ACCEPTED);
      return;
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Get('info')
  @Roles(Role.Admin, Role.Booth, Role.Reader, Role.User)
  getSuperUserProfile(@CurrentUser() user: any) {
    return user;
  }

  @Public()
  @Post('user/send-otp')
  async sendOtp(@Body() { number }: NumberDto, @Res() res: Response) {
    try {
      const exist = await this.authService.userExist(number);
      if (exist.number) {
        const otp = await this.otpService.generateOtp(number);
        await this.otpService.sendOtpToUser(
          { email: exist.email, name: exist.name, number: exist.number },
          otp,
        );
        res
          .send({
            status: 'success',
            message: 'OTP Sent, check your email or sms',
          })
          .status(HttpStatus.ACCEPTED);
        return;
      }
      return;
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Public()
  @Post('user/verify-otp')
  async verifyOtp(@Body() { number, otp }: VerifyOtpDto, @Res() res: Response) {
    try {
      const { access_token, refresh_token, extra } =
        await this.authService.validateUserByNumber(number, otp);
      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        domain:
          process.env.NODE_ENV !== 'development'
            ? process.env.domain
            : 'localhost',
      });
      res
        .send({
          status: 'success',
          message: 'Tokens',
          data: {
            access_token,
            ...extra,
          },
        })
        .status(HttpStatus.ACCEPTED);
      return;
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }
  @Public()
  @Post('register')
  async registerUser(@Body() registerDto: RegisterDto) {
    try {
      await this.authService.register(registerDto);
      return new SuccessResponse('OTP sent successfully');
    } catch (err) {
      throw new UnauthorizedException(err?.message || 'Verification failed');
    }
  }

  @Public()
  @Post('verify')
  async verifyRegistration(
    @Body() verifyDto: VerifyOtpDto,
    @Res() res: Response,
  ) {
    try {
      const { access_token, refresh_token, extra } =
        await this.authService.verify(verifyDto.number, verifyDto.otp);
      res.cookie('refreshToken', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        domain:
          process.env.NODE_ENV !== 'development'
            ? process.env.domain
            : 'localhost',
      });
      res
        .send({
          status: 'success',
          message: 'Tokens',
          data: {
            access_token,
            ...extra,
          },
        })
        .status(HttpStatus.ACCEPTED);
      return;
    } catch (err) {
      throw new UnauthorizedException(err?.message || 'Verification failed');
    }
  }

  @Public()
  @Post('oauth')
  async oauth(@Body() { token }: { token: string }, @Res() res: Response) {
    try {
      const { status, response } = await checkUserExists(token);
      if (status === 'success') {
        const register = await this.authService.validateOAuthAndLogin({
          phoneNumber: response.phoneNumber || '0100',
          email: response.email,
          displayName: response.displayName || 'temp',
          photoURL: response.photoURL,
        });
        res.status(HttpStatus.ACCEPTED).send({
          status: 'success',
          message: 'Tokens',
          data: {
            access_token: register.access_token,
            ...register.extra,
          },
        });
        return;
      }
      res.status(HttpStatus.UNAUTHORIZED).send({
        status: 'error',
        message: 'Token is invalid',
        data: null,
      });
    } catch (err) {
      throw new UnauthorizedException(err?.message || 'Verification failed');
    }
  }
}
