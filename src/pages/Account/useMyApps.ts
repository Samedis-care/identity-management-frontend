import { useQuery } from "@tanstack/react-query";
import BackendConnector from "../../components-care/connectors/BackendConnector";

/** an app the signed-in user has access to (GET v1/user/apps) */
export interface MyApp {
  id: string;
  name: string;
  full_name: string | null;
  url: string;
  image: {
    small: string | null;
    medium: string | null;
    large: string | null;
  } | null;
  required_documents: string[];
  requires_acceptance: string[];
}

export const MY_APPS_QUERY_KEY = ["my-user-apps"];

/** the apps of the signed-in user, shared by the apps page and the header */
export const useMyApps = () =>
  useQuery({
    queryKey: MY_APPS_QUERY_KEY,
    queryFn: async () =>
      (
        await new BackendConnector("v1/user/apps").index({ rows: 100 })
      )[0] as unknown as MyApp[],
  });
