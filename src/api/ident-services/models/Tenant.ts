import { Image } from "./Image";

export interface Tenant {
  id: string;
  candos: string[];
  short_name: string | null;
  full_name: string;
  image: Image;
  // IM caches a user's tenant list for up to a day, so an older copy lacks it
  image_size?: number | null;
}
