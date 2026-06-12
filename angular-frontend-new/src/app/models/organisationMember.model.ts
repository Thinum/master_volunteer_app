import {User} from './user.model';

export interface OrganisationMember {
  id: number;
  user: User;
  engagementLevel: number;
  joinedAt: Date;
}
