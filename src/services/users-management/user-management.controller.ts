/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Param, Body, Query, Delete } from '@nestjs/common';
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

@ApiTags('users')
@Controller('users')
@Roles(Role.Admin)
export class UsersManagmentController {
  constructor(private readonly usersService: UsersManagmentService) { }

  @Post()
  @SwaggerRoute(UsersSwaggerConfig.createUser)
  async createUser(@Body() data: CreateUserViaAdminDto) {
    return this.usersService.createUser(data);
  }

  @Get()
  @SwaggerRoute(UsersSwaggerConfig.listAllUsers)
  async listAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: UserStatus,
    @Query('gender') gender?: 'Male' | 'Female',
  ) {
    const pageNumber = parseInt(page, 10) || 1;  // Convert to number and apply default
    const limitNumber = parseInt(limit, 10) || 10;  // Convert to number and apply default
    const filters = { status, gender };
    return this.usersService.listAllUsers(pageNumber, limitNumber, filters);
  }


  @Put(':id')
  @SwaggerRoute(UsersSwaggerConfig.changeUserStatus)
  async changeUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UserStatus,
  ) {
    return this.usersService.changeUserStatus(userId, status);
  }

  @Get('super')
  @SwaggerRoute(SuperUsersSwaggerConfig.findAllSuperUsers)
  @Roles(Role.SuperAdmin)
  async findAllSuperUsers() {
    return this.usersService.findAllSuperUsers();
  }

  @Get(':id')
  @SwaggerRoute(UsersSwaggerConfig.findUser)
  async findUser(@Param('id') id: string) {
    return this.usersService.findUser(id);
  }

  @Post('super')
  @SwaggerRoute(SuperUsersSwaggerConfig.createSuperUser)
  @Roles(Role.SuperAdmin)
  async createSuperUser(@Body() data: CreateSuperUserViaAdminDto) {
    return this.usersService.createSuperUser(data);
  }


  @Delete('super/:id/delete')
  @Roles(Role.SuperAdmin)
  async removeSuperUser(@Param('id') superUserId: string) {
    return this.usersService.removeSuperUser(superUserId);
  }
}
