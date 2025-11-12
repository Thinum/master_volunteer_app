import { User } from './user.model';

/**
 * Represents an organization in the system.
 */
export interface Organisation {
  /** Unique identifier for the organization. */
  id: number;

  /** Official name of the organization. */
  orgName: string;

  /** Geographical location of the organization (latitude and longitude). */
  location: {
    lat: number;
    lon: number;
  };

  /** Optional profile picture (Base64 or URL). */
  profilePicture?: string;

  /** Timestamp when the organization was created. */
  createdAt: Date;

  /** Description or body text for the organization. */
  body: string;

  /** Indicates whether the organization is currently deactivated. */
  deactivated: boolean;

  /** Timestamp for when the organization is set to be reactivated, if applicable. */
  reactivationTime?: Date;

  /** Organization contacts or representatives (users). */
  orgContacts?: User[];
}
