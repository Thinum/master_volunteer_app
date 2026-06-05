import {User} from './user.model';

export enum NotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPTED = "FRIEND_ACCEPTED",
  FRIEND_REJECTED = "FRIEND_REJECTED",
}

export interface AppNotification {
  id?: number;
  type: NotificationType; //remove for enum
  title?: string;
  text?: string;
  hasBeenRead: boolean;
  createdAt: Date;
  user?: User;
  notificationPayloadList?: AppNotificationPayload[];
}

export interface AppNotificationPayload {
  id?: number;
  payloadType: string;
  payload: string;
}
