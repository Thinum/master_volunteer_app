export interface Activity {
  id: number;
  title: string;
  body: string;
  project_id: number;
  organisation_id: number;
  appointment_ids: number[];
}
