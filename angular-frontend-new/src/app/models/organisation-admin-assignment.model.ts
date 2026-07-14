import { User } from './user.model';

export interface OrganisationAdminAssignment {
  organisationId: number;
  organisationName: string;
  admins: User[];
}
