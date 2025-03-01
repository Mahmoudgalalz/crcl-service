import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationGlobalEventProps } from '../events/global-notification.event';
import { sendNotificationToTopic } from 'src/services/notification/firebase.service';

@Injectable()
export class GlobalNotificationEventListener {
  @OnEvent('notification.send')
  async handleNotificationEvent(event: NotificationGlobalEventProps) {
    Logger.log('Notification Event Received');
    const { payload, topic } = event;
    const { status, error, response } = await sendNotificationToTopic(
      topic,
      payload,
    );
    if (status === 'error') {
      Logger.error(error);
    }
    Logger.log(response);
    Logger.log('Notification Event Sent');
  }
}
