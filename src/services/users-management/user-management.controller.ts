import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Delete,
  Patch,
  Req,
  ParseBoolPipe,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UsersManagmentService } from 'src/services/users-management/user-management.service';
import { UserStatus, UserType } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerRoute } from 'src/shared/decorators/swagger.decorator';
import {
  SuperUsersSwaggerConfig,
  UsersSwaggerConfig,
} from './users.swagger.config';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
import { CreateUserViaAdminDto } from './dto/create-user.dto';
import { CreateSuperUserViaAdminDto } from './dto/create-admin.dto';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { TopUpDto, UpadteUserViaAdminDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { UpdateSuperUserViaAdminDto } from './dto/update-admin.dto';

@ApiTags('users')
@Controller('users')
@Roles(Role.Admin)
export class UsersManagmentController {
  constructor(private readonly usersService: UsersManagmentService) {}

  @Post()
  @SwaggerRoute(UsersSwaggerConfig.createUser)
  async createUser(@Body() data: CreateUserViaAdminDto) {
    try {
      const user = await this.usersService.createUser(data);
      return new SuccessResponse('Created User', user);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get()
  @SwaggerRoute(UsersSwaggerConfig.listAllUsers)
  async listAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: UserStatus,
    @Query('gender') gender?: 'Male' | 'Female',
    @Query('search') search?: string,
    @Query('types') types?: UserType[] | UserType,
    @Query('notification', ParseBoolPipe) notification: boolean = false,
  ) {
    const filters = { types, status, gender, notification };
    try {
      if (search) {
        const result = await this.usersService.searchUsers(search, filters);
        return new SuccessResponse('List search users', result);
      }
      const result = await this.usersService.listAllUsers(page, limit, filters);
      return new SuccessResponse('List of all users', result);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Put(':id')
  @SwaggerRoute(UsersSwaggerConfig.changeUserStatus)
  async changeUserStatus(
    @Param('id') userId: string,
    @Body() data: UpadteUserViaAdminDto,
  ) {
    try {
      const user = await this.usersService.changeUserStatus(
        userId,
        data.status,
      );
      return new SuccessResponse('Updated User', user);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Delete(':id')
  async deleteUser(@Res() res: Response, @Param('id') userId: string) {
    try {
      const user = await this.usersService.deleteUser(userId);
      res.status(HttpStatus.ACCEPTED).send({
        status: 'success',
        message: 'Deleted user',
        data: user,
      });
      return;
    } catch (error) {
      Logger.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: 'error',
        message: 'error deleting a user',
        error,
      });
      return;
    }
  }

  @Get(':id')
  @SwaggerRoute(UsersSwaggerConfig.findUser)
  async findUser(@Param('id') id: string) {
    try {
      const user = await this.usersService.findUser(id);
      return new SuccessResponse('User data', user);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Patch('wallet/:id')
  @SwaggerRoute(UsersSwaggerConfig.findUser)
  async topUpWallet(@Param('id') id: string, @Body() data: TopUpDto) {
    try {
      const topUp = await this.usersService.topUpOrDownWallet(id, data);
      return new SuccessResponse('Alter user wallet balance', topUp);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Post('super')
  @SwaggerRoute(SuperUsersSwaggerConfig.createSuperUser)
  async createSuperUser(@Body() data: CreateSuperUserViaAdminDto) {
    try {
      const user = await this.usersService.createSuperUser(data);
      return new SuccessResponse('Created SuperUser', user);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Put('super/:id')
  async updateSuperUser(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body() data: UpdateSuperUserViaAdminDto,
  ) {
    try {
      const user = req.user;
      const update = await this.usersService.updateSuperUser(
        user,
        userId,
        data,
      );
      return new SuccessResponse('Update SuperUser', update);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Delete('super/:id')
  async deleteSuperUser(@Req() req: Request, @Param('id') userId: string) {
    try {
      const update = await this.usersService.deleteSuperUser(userId);
      return new SuccessResponse('Delete SuperUser', update);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('super/users')
  @SwaggerRoute(SuperUsersSwaggerConfig.findAllSuperUsers)
  async findAllSuperUsers() {
    try {
      const users = await this.usersService.findAllSuperUsers();
      return new SuccessResponse('All SuperUser data', users);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
