import { BackendError, RailsApiClient } from "components-care";
import { GetParams } from "components-care/dist/backend-integration/Connector/JsonApiClient";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import {
  destroySession,
  handleAuth,
} from "../../pages/components/AuthProvider";
import * as Sentry from "@sentry/react";

interface PotentialErrorResponse {
  meta?: {
    msg?: {
      success?: boolean;
      error?: string;
      message?: string;
    };
  };
}

class BackendHttpClient extends RailsApiClient {
  constructor() {
    super(
      () => handleAuth(),
      async (
        _response: Response,
        responseData: unknown,
        method: string,
        url: string,
        args: GetParams,
        body: unknown | null,
        auth: AuthMode,
      ): Promise<unknown> => {
        const rsp = responseData as PotentialErrorResponse;

        const success = rsp.meta?.msg?.success;
        const error = rsp.meta?.msg?.error;
        const message = rsp.meta?.msg?.message;
        if (!success) {
          if (
            error === "invalid_token" ||
            error === "token_invalid" ||
            error === "token_expired" ||
            error === "otp_too_many_tries"
          ) {
            if (auth === AuthMode.Off) {
              throw new Error("Authentication is needed, but wasn't specified");
            }
            if (auth !== AuthMode.Try) {
              await destroySession();
              // retry
              return this.request(method, url, args, body, auth);
            }
          }
          throw new BackendError(message || error || "Invalid response", error);
        }

        return responseData;
      },
      undefined,
      undefined,
      (error) => {
        if (error.name === "NetworkError") return;
        if (error.name === "BackendError") return;
        Sentry.captureException(error);
      },
    );
  }
}

export default new BackendHttpClient();
