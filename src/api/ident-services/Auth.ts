import { Image } from "./models/Image";

export interface OauthTokenResponse {
  data: {
    attributes: {
      id: string;
      actor_id: string;
      email: string;
      first_name: string;
      last_name: string;
      image: Image;
      candos: string[];
      otp_enabled: boolean;
      otp_provided: boolean;
    };
  };
  meta: {
    token: string;
    expires_in: number;
    refresh_token: string;
    redirect_url?: string;
    app?: string;
    check_acceptances?: string[];
  };
}
