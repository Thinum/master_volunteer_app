/**
 * Represents an activity or event in the system.
 */
import type { Organisation } from './organisation.model';
import type { Appointment } from './appointment.model';
import type { User } from './user.model';
import type { ActivitySkillRequirement } from './skill.model';

export interface InterestCategory {
  code: string;
  label: string;
  conceptUri?: string;
  conceptSchemeUri?: string;
  escoConceptUri?: string;
  aliases?: string[];
  broaderConceptUris?: string[];
  relatedSkillLabels?: string[];
}

export interface TagConcept {
  conceptUri: string;
  preferredLabel: string;
  alternativeLabels?: string[];
  relatedInterestCodes?: string[];
  relatedSkillLabels?: string[];
  source?: string;
}

export type RecommendationReasonType = 'INTEREST' | 'REQUIRED_SKILL' | 'PREFERRED_SKILL' | 'TAG' | 'CATEGORY';

export interface RecommendationReason {
  type: RecommendationReasonType;
  label: string;
  detail: string;
  scoreContribution: number;
}

export interface ActivityRecommendation {
  activity: Activity;
  score: number;
  reasons: RecommendationReason[];
}

export interface ActivityRecommendationSummary {
  score: number;
  reasons: RecommendationReason[];
}

export interface Activity {
  id: number;
  title: string;
  body: string;

  // optional grouping
  projectId?: number;

  // relations
  organisations: Organisation[];
  appointments: Appointment[];
  participants?: User[];

  // scheduling
  date?: Date;
  startTime?: string;
  endTime?: string;
  duration?: string;
  expiresAt?: Date;

  // location
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // content enrichment
  description?: string;
  tags?: string[];
  categories?: InterestCategory[];
  difficulty?: 'easy' | 'medium' | 'hard';
  isPublic?: boolean;
  status?: 'open' | 'upcoming' | 'finished' | 'canceled';

  // skills & requirements
  skills: string[];
  requiredSkills?: ActivitySkillRequirement[];
  preferredSkills?: ActivitySkillRequirement[];
  qualifications: string[];
  prerequisites: string[];
  recommendation?: ActivityRecommendationSummary;

  // logistics
  capacity?: number;
  spotsTaken?: number;
  equipmentProvided?: string[];

  // people & contacts
  createdBy?: User;
  contacts?: {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
  }[];

  orgContacts?: {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
  }[];

  // timestamps
  createdAt: Date;
  updatedAt: Date;
}
