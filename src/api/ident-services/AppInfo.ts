import { DataResponse } from "./Common";
import { Image } from "./models/Image";
import { ThemeOptions } from "@mui/material";

export interface AppInfo {
  id: string;
  name: string;
  short_name: string;
  full_name: string;
  image: Image;
  config: {
    url: string;
    uses_bearer_token: boolean;
    locales: string[];
    mailer: {
      from: string;
      reply_to: string;
    };
    theme: Partial<ThemeOptions["palette"]> & {
      components_care: Record<string, unknown>; // Partial<ComponentsCareTheme> but with snake_case keys instead of camelCase
    };
  };
  contents: {
    id: string;
    name: string;
    url: string;
    version: number;
  }[];
}

export type AppInfoResponse = DataResponse<{
  id: string;
  type: "app_info";
  attributes: AppInfo;
}>;
