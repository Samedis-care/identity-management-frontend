import { Image } from "./Image";

export interface Tenant {
  id: string;
  candos: string[];
  short_name: string | null;
  full_name: string;
  image: Image;
}
