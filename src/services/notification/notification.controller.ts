import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Response } from 'express';
import { SuccessResponse } from 'src/shared/success-response';
import {
  BulkPushNotifiaction,
  PushNotifiaction,
} from './dto/bulk-notification.dto';
import { addUsersNotifiaction } from './dto/add-users.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Res() res: Response,
  ) {
    try {
      const notification = await this.notificationsService.create(
        createNotificationDto,
      );
      return res
        .status(HttpStatus.CREATED)
        .send(new SuccessResponse('Notification Created', notification));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const notifications = await this.notificationsService.findAll();
      return res
        .status(HttpStatus.OK)
        .send(new SuccessResponse('Notifications Fetched', notifications));
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const notification = await this.notificationsService.findOne(id);
      return res
        .status(HttpStatus.OK)
        .send(new SuccessResponse('Notification Fetched', notification));
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: error.message,
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Res() res: Response,
  ) {
    try {
      const updatedNotification = await this.notificationsService.update(
        id,
        updateNotificationDto,
      );
      return res
        .status(HttpStatus.OK)
        .send(new SuccessResponse('Notification Updated', updatedNotification));
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: error.message,
      });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      const deletedNotification = await this.notificationsService.delete(id);
      return res
        .status(HttpStatus.OK)
        .send(new SuccessResponse('Notification Deleted', deletedNotification));
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: error.message,
      });
    }
  }

  @Patch(':notificationId/users')
  async addUserToNotificationGroup(
    @Param('notificationId') notificationId: string,
    @Body() payload: addUsersNotifiaction,
    @Res() res: Response,
  ) {
    try {
      const updatedNotification =
        await this.notificationsService.addUserToNoticationGroup(
          payload.usersIds,
          notificationId,
        );
      return res
        .status(HttpStatus.OK)
        .send(
          new SuccessResponse(
            'Users Added to Notification Group',
            updatedNotification,
          ),
        );
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }

  @Delete(':notificationId/users')
  async removeUserFromNotificationGroup(
    @Param('notificationId') notificationId: string,
    @Body() payload: addUsersNotifiaction,
    @Res() res: Response,
  ) {
    try {
      const updatedNotification =
        await this.notificationsService.removeUserFromNotificationGroup(
          payload.usersIds,
          notificationId,
        );
      return res
        .status(HttpStatus.OK)
        .send(
          new SuccessResponse(
            'Users Removed from Notification Group',
            updatedNotification,
          ),
        );
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }

  @Post(':userId/push-notification')
  async pushNotification(
    @Param('userId') userId: string,
    @Body() payload: PushNotifiaction,
    @Res() res: Response,
  ) {
    try {
      const result = await this.notificationsService.pushNotification(
        userId,
        payload,
      );
      return res
        .status(HttpStatus.OK)
        .send(new SuccessResponse('Notification Sent', result));
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  }

  @Post('bulk-push')
  async bulkPushNotification(
    @Body() payload: BulkPushNotifiaction,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.notificationsService.bulkPushNotifiaction(payload);
      return res
        .status(HttpStatus.OK)
        .send(new SuccessResponse('Bulk Notifications Sent', result));
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
  }
}
