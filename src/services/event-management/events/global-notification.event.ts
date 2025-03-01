export type NotificationGlobalEventProps = {
  topic: string;
  payload: { title: string; body: string };
};

export class GlobalNotificationEvent {
  constructor(public readonly data: NotificationGlobalEventProps) {}
}
