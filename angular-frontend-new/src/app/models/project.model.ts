export interface Project {
  id: number;
  title: string;
  description: string;
  location?: {
    lat: number;
    lon: number;
  };
  startDate?: string;
  endDate?: string;
  closed: boolean;
  organisationId: number;
  organisationName?: string;
  activityCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
