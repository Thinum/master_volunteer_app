/**
 * Represents an organization in the system.
 */
export interface Organisation {
    /**
     * Unique identifier for the organization.
     */
    id: number;

    /**
     * Name of the organization.
     */
    orgName: string;

    /**
     * Geographical location of the organization (latitude and longitude).
     */
    location: {
        lat: number;
        lon: number;
    };

    /**
     * Base64-encoded string of the organization's profile picture.
     */
    profilePicture?: string;

    /**
     * Timestamp when the organization was created.
     */
    createdAt: string;

    /**
     * Description or body content for the organization.
     */
    body: string;

    /**
     * Indicates whether the organization is currently deactivated.
     */
    deactivated: boolean;

    /**
     * Timestamp for when the organization is set to be reactivated, if applicable.
     */
    reactivationTime?: string;
}
