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

  /** Optional phone number of the user. */
  phone?: string;

  /** URL or Base64 string for the user's profile picture. */
  profilePicture?: string;

  /** Timestamp when the user joined. */
  joinedAt: Date;

  /** Indicates whether the user is currently active. */
  isActive?: boolean;
}
