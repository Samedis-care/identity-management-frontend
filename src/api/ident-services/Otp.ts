import { useMutation } from "@tanstack/react-query";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import useAccountApp from "../../utils/useAccountApp";
import { DataResponse } from "./Common";

/** TOTP state of the user; the backup codes come only with the start of an enrollment */
export interface OtpAttributes {
  otp_enabled: boolean;
  otp_provisioning_qr_code: string;
  otp_secret_key: string;
  otp_backup_codes: string[];
}

export type OtpResponse = DataResponse<{ attributes: OtpAttributes }>;

/**
 * otp_enable "true" starts an enrollment (new secret and QR code), a code
 * confirms it; otp_disable takes a code or a backup code
 */
export type OtpRequest = { otp_enable: string } | { otp_disable: string };

/**
 * Changes TOTP with a PUT on the user of the app the account pages were opened
 * from, so the authenticator entry carries that app's name. Not through
 * ProfileModel: the response carries the QR code, the secret and the backup
 * codes, which the model doesn't hold. A wrong code is answered with the
 * unchanged state, which fails the mutation.
 */
export const useOtpMutation = () => {
  const app = useAccountApp();
  return useMutation({
    mutationFn: async (data: OtpRequest) => {
      const { attributes } = (
        await BackendHttpClient.put<OtpResponse>(`/api/v1/${app}/user`, null, {
          data,
        })
      ).data;
      const refused =
        "otp_disable" in data
          ? attributes.otp_enabled
          : data.otp_enable !== "true" && !attributes.otp_enabled;
      if (refused) throw new Error("TOTP code refused");
      return attributes;
    },
  });
};
