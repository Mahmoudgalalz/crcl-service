import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { UsersManagmentService } from 'src/services/users-management/user-management.service';
import { UserStatus } from '@prisma/client';
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
  ) {
    const filters = { status, gender };
    try {
      const users = await this.usersService.listAllUsers(page, limit, filters);
      return new SuccessResponse('List of all users', users);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Put(':id')
  @SwaggerRoute(UsersSwaggerConfig.changeUserStatus)
  async changeUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UserStatus,
  ) {
    try {
      const user = await this.usersService.changeUserStatus(userId, status);
      return new SuccessResponse('Updated User', user);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get(':id')
  @SwaggerRoute(UsersSwaggerConfig.findUser)
  async findUser(@Param('id') id: string) {
    return this.usersService.findUser(id);
  }

  @Post('super')
  @SwaggerRoute(SuperUsersSwaggerConfig.createSuperUser)
  async createSuperUser(@Body() data: CreateSuperUserViaAdminDto) {
    return this.usersService.createSuperUser(data);
  }

  @Get('super')
  @SwaggerRoute(SuperUsersSwaggerConfig.findAllSuperUsers)
  async findAllSuperUsers() {
    return this.usersService.findAllSuperUsers();
  }
}
