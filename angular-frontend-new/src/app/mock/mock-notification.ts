import {AppNotification, NotificationType} from '../models/notification.model';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 0,
    type: NotificationType.FRIEND_REQUEST,
    text: 'Someone sent you a friend request',
    hasBeenRead: false,
    title: "",
    createdAt: new Date(),
    notificationPayloadList: [],
  }
];
