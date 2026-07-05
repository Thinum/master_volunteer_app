import { Organisation } from './organisation.model';
import { Activity } from './activity.model';
import { User } from './user.model';

export interface CommunityGoalContribution {
member: User;
activities: Activity[];
}

export interface CommunityGoal {
id?: number;

// basic info
title: string;
description?: string;

// goal metrics
targetValue: number;
currentValue?: number;
activityTags?: string[];
contributions?: CommunityGoalContribution[];

// timeframe
startDate?: Date;
endDate?: Date;

// status
status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

// timestamps
createdAt?: Date;
updatedAt?: Date;

// relation
organisation?: Organisation;
}
