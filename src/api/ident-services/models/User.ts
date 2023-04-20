import { Image } from "./Image";
import { Tenant } from "./Tenant";

export interface User {
  id: string;
  candos: string[];
  company: string | null;
  department: string | null;
  email: string;
  gender: number;
  first_name: string;
  last_name: string;
  image: Image | null;
  job_title: string | null;
  locale: string | null;
  mobile: string | null;
  personnel_number: string | null;
  short: string | null;
  tenants: Tenant[];
  username: string;
}
