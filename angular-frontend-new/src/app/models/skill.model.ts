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

  /** Canonical external concept identifier (an ESCO URI when source is ESCO). */
  conceptUri?: string;

  alternativeLabels?: string[];
  skillType?: string;
  reuseLevel?: string;
  broaderConceptUris?: string[];
  relatedInterestCodes?: string[];
  source?: string;
  sourceVersion?: string;
}

/** Wire format returned by the backend's ESCO-compatible skill catalogue. */
export interface SkillConcept {
  conceptUri?: string;
  preferredLabel: string;
  alternativeLabels?: string[];
  description?: string;
  skillType?: string;
  reuseLevel?: string;
  broaderConceptUris?: string[];
  relatedInterestCodes?: string[];
  source?: string;
  sourceVersion?: string;
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
