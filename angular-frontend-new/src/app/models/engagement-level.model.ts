export type EngagementTimeUnit = 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

export interface EngagementLevelRequirement {
  level: number;
  name: string;
  engagementLabel: string;
  functionality: string[];
  unlockCondition: string;
  registrationLimit: number | null;
  requiredActivities: number;
  timespanValue: number;
  timespanUnit: EngagementTimeUnit;
  permanentOnceReached: boolean;
}

export interface EngagementLevelOverview {
  organisationId: number;
  organisationName: string;
  canManage: boolean;
  currentLevel: number;
  currentLevelName: string;
  activeRegistrations: number;
  canInvite: boolean;
  inviteLimitation: string | null;
  canManageActivitiesAndGoals: boolean;
  managementLimitation: string | null;
  levels: EngagementLevelRequirement[];
}

export interface ActivityEngagementAccess {
  member: boolean;
  organisationId: number;
  currentLevel: number;
  currentLevelName: string;
  activeRegistrations: number;
  registrationLimit: number | null;
  canRegister: boolean;
  canDeregister: boolean;
  limitationMessage: string | null;
}
