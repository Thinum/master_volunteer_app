import {
  AppNotification,
  NotificationType
} from '../models/notification.model';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: -1,
    type: NotificationType.COMMUNITY_GOAL_PROGRESS,
    text: 'Your organisation’s community goal is 75% complete.',
    hasBeenRead: false,
    title: 'Community goal update',
    createdAt: new Date(),
    communityGoalTitle: '100 volunteer hours',
    organisationName: 'Green Community Linz',
    notificationPayloadList: [
      {payloadType: 'progress', payload: '75'},
      {payloadType: 'communityGoalTitle', payload: '100 volunteer hours'},
      {payloadType: 'organisationName', payload: 'Green Community Linz'}
    ],
  }
];
