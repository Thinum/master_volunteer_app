/**
 * Represents a user in the system.
 */
export interface User {
    /**
     * Unique identifier for the user.
     */
    id: number;

    /**
     * Full name of the user.
     */
    name: string;

    /**
     * Email address of the user.
     */
    email: string;

    /**
     * Base64-encoded string of the user's profile picture.
     */
    profilePicture?: string;

    /**
     * Timestamp when the user joined.
     */
    joinedAt: Date;
}
