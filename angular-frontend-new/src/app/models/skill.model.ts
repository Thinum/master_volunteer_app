/**
 * Represents a skill that can be associated with activities or users.
 */
export interface Skill {
  /** Unique identifier for the skill. */
  id: number;

  /** Human-readable name of the skill. */
  name: string;

  /** Optional category (e.g., "Soft Skill", "Technical", "Organizational"). */
  category?: string;

  /** Optional description or example usage. */
  description?: string;
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface UserSkillProfile {
  name: string;
  escoSkillUri?: string;
  proficiency?: SkillProficiency;
}

export interface ActivitySkillRequirement {
  name: string;
  escoSkillUri?: string;
  minimumProficiency?: SkillProficiency;
  required: boolean;
}
