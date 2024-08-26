import { DataResponse } from "./Common";
import { Image } from "./models/Image";
import { ThemeOptions } from "@mui/material";

export interface AppInfo {
  id: string;
  name: string;
  short_name: string;
  full_name: string;
  image: Image;
  auth_provider_hints: string[]; // md5(email domain)[]
  config: {
    url: string;
    uses_bearer_token: boolean;
    locales: string[];
    mailer: {
      from: string;
      reply_to: string;
    };
    theme: Partial<ThemeOptions["palette"]> & {
      components_care?: {
        ui_kit?: {
          action_button?: {
            background_color?: string;
          };
        };
      };
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
