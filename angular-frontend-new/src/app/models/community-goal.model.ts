import { Organisation } from './organisation.model';

export interface CommunityGoal {
id?: number;

// basic info
title: string;
description?: string;

// goal metrics
targetValue: number;
currentValue?: number;

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
