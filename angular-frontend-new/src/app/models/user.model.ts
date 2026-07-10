import type { Organisation } from './organisation.model';
import type { Activity, InterestCategory } from './activity.model';
import type { UserSkillProfile } from './skill.model';

/**
 * Represents a user in the system.
 */
export interface User {
  /** Unique identifier for the user. */
  id: number;

  /** Full name of the user. */
  name: string;

  /** Email address of the user. */
  email: string;

  /** Username used for authentication and display. */
  username?: string;

  /** Optional phone number of the user. */
  phone?: string;

  /** URL or Base64 string for the user's profile picture. */
  profilePicture?: string;

  /** Skills selected from the shared skill catalogue. */
  skills?: string[];
  skillProfiles?: UserSkillProfile[];

  /** Fields of interest selected from the custom interest taxonomy. */
  interests?: string[];
  interestCategories?: InterestCategory[];

  /** Timestamp when the user joined. */
  joinedAt: Date;

  /** Indicates whether the user is currently active. */
  isActive?: boolean;

  /** List of friends for the user. */
  friends?: User[];

  /** List of organisations joined by the user. */
  organisations?: Organisation[];

  /** List of activities joined by the user. */
  activities?: Activity[];
}
