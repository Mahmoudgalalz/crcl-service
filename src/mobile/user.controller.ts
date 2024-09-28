import { Controller, Get } from '@nestjs/common';

@Controller('users') // Shared path between both modules
export class UsersController {
  @Get()
  getUserData() {
    return { message: 'This for Mobile' };
  }
}
