import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GlobalNotificationEvent } from '../events/global-notification.event';
import { sendNotificationToTopic } from 'src/services/notification/firebase.service';

@Injectable()
export class GlobalNotificationEventListener {
  @OnEvent('notification.send')
  async handleNotificationEvent(event: GlobalNotificationEvent) {
    Logger.log('Notification Event Received');
    const { payload } = event.data;

    const { status, error } = await sendNotificationToTopic('global', payload);
    if (status === 'error') {
      Logger.error(error);
    }
    Logger.log('Notification Event Sent');
  }
}
