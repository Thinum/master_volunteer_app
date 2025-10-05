export interface Project {
  id: number;
  title: string;
  description: string;
  location?: {
    lat: number;
    lon: number;
  };
  closed: boolean;
}
