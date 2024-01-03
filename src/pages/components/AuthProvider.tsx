import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import Cookies from "js-cookie";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { GetCurrentUserResponse } from "../../api/ident-services/CurrentUser";
import {
  BackendError,
  FrameworkHistory,
  Loader,
  showInfoDialog,
  useDialogContext,
  usePermissionContext,
} from "components-care";
import * as Sentry from "@sentry/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ANONYMOUS_USER_ID = "anonymous";

export interface AuthProviderProps {
  /**
   * The children having access to user and tenant information (AuthProviderContext)
   */
  children: React.ReactNode;
  /**
   * Auth is optional? Sets AuthContext to anonymous user on auth failure
   */
  optional?: boolean;
}

export type AuthProviderContextType =
  GetCurrentUserResponse["data"]["attributes"] & {
    updated_at: Date;
  };

const AuthProviderContext = React.createContext<
  AuthProviderContextType | undefined
>(undefined);
export const useAuthProviderContext = () => {
  const ctx = useContext(AuthProviderContext);
  if (!ctx) throw new Error("Auth Provider context not set");
  return ctx;
};

export type AuthProviderResetContextType = () => void;
const AuthProviderResetContext = React.createContext<
  AuthProviderResetContextType | undefined
>(undefined);
export const useAuthProviderReset = () => {
  const ctx = useContext(AuthProviderResetContext);
  if (!ctx) throw new Error("Auth Provider context is not set");
  return ctx;
};

//
// Authentication Utils
//

class AuthError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "AuthError";
  }
}

const parseUrlParams = () =>
  new URLSearchParams(window.location.hash.replace("#", "?"));

export const getSession = () =>
  parseUrlParams().get("token") ||
  sessionStorage.getItem("token") ||
  Cookies.get("token") ||
  localStorage.getItem("token") ||
  null;

export const getSessionExpire = () => {
  const expireStr =
    parseUrlParams().get("token_expire") ||
    sessionStorage.getItem("token_expire") ||
    Cookies.get("token_expire") ||
    localStorage.getItem("token_expire");
  if (!expireStr) return null;
  return new Date(/^[0-9]+$/.test(expireStr) ? parseInt(expireStr) : expireStr);
};

export const getSessionRefreshToken = () =>
  parseUrlParams().get("refresh_token") ||
  sessionStorage.getItem("refresh_token") ||
  Cookies.get("refresh_token") ||
  localStorage.getItem("refresh_token") ||
  null;

export const destroySession = async () => {
  if (isSessionValid()) {
    // fire and forget
    try {
      await BackendHttpClient.post(
        "/api/v1/oauth/revoke",
        null,
        {
          token_type_hint: getSessionRefreshToken()
            ? "access_token"
            : undefined,
        },
        AuthMode.Try
      );
    } catch (e) {}
  }

  const errors: string[] = [];
  const search = parseUrlParams();
  ["token", "token_expire", "refresh_token"].forEach((key) => {
    Cookies.remove(key);
    if (Cookies.get(key)) errors.push(`cookie ${key}`);
    delete localStorage[key];
    if (localStorage.getItem(key)) errors.push(`localStorage ${key}`);
    delete sessionStorage[key];
    if (sessionStorage.getItem(key)) errors.push(`sessionStorage ${key}`);
    search.delete(key);
  });
  const newHash = search.toString(); // also strip tokens from URL if present
  window.location.hash = newHash ? "#" + newHash : "";

  if (getSession()) errors.push("getSession");
  if (getSessionExpire()) errors.push("getSessionExpire");
  if (getSessionRefreshToken()) errors.push("getSessionRefreshToken");
  if (errors.length > 0) {
    Sentry.captureException(new Error("destroySession failure"), {
      extra: {
        errors,
        href: window.location.href,
        cookies: Object.keys(Cookies.get()),
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
      },
    });
    throw new Error("Failed deleting session.");
  }
};

export const redirectToLogin = (includeRedirectURl = true) => {
  const redirectUrl = includeRedirectURl
    ? window.location.href
    : window.location.origin;

  const loginFail = redirectUrl.includes("/login/identity-management");

  FrameworkHistory.push({
    pathname: "/login/identity-management",
    search: `redirect_host=${encodeURIComponent(redirectUrl)}`,
    // key: Math.random().toString(),
  });

  if (loginFail) throw new Error("Login timeout, please try again");
};

export const isSessionValid = (): boolean => {
  const session = getSession();
  const sessionExpire = getSessionExpire();
  return !!(session && sessionExpire && sessionExpire > new Date());
};

let temporarilyDisableAutoRedirectToLogin = false;

export const handleAuth = async (): Promise<string> => {
  let session = getSession();
  if (!isSessionValid()) {
    await destroySession();
    if (!temporarilyDisableAutoRedirectToLogin) {
      redirectToLogin();
    }
    throw new AuthError("No authentication set");
  }
  return "Bearer " + session;
};

/**
 * Auth Provider for Ident.Services
 * @constructor
 */
const AuthProvider = (props: AuthProviderProps) => {
  const { children, optional } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [pushDialog] = useDialogContext();
  const [ctx, setCtx] = useState<AuthProviderContextType | undefined>(
    undefined
  );
  const [, setPerms] = usePermissionContext();

  const resetAuthContext = useCallback(() => {
    setCtx(undefined);
  }, []);

  // handle /authenticated and enforce authentication
  useEffect(() => {
    if (ctx) return;

    (async () => {
      // handle authentication page
      if (location.pathname === "/authenticated") {
        // save auth params
        const search = parseUrlParams();
        navigate(
          {
            pathname: location.pathname,
            search: location.search,
            hash: "",
          },
          { replace: true }
        );
        const rememberMe = search.get("remember_me") === "true";
        const tokens = Object.fromEntries(
          ["token", "refresh_token", "token_expire", "invite_token"].map(
            (key) => [key, search.get(key)]
          )
        );
        Object.entries(tokens)
          .filter(([k]) => k !== "invite_token")
          .forEach(([k, v]) => {
            if (!v) return;
            sessionStorage.setItem(k, v);
            Cookies.set(k, v);
            if (rememberMe) localStorage.setItem(k, v);
          });

        // accept invite
        const { invite_token } = tokens;
        if (invite_token) {
          while (true) {
            let tryAgain = true;
            try {
              await BackendHttpClient.put<never>(
                `/api/v1/user/invitations/${encodeURI(invite_token)}`,
                null,
                {}
              );
            } catch (e) {
              Sentry.captureException(e);
              await showInfoDialog(pushDialog, {
                title: t("auth_provider.fail_accept_invite.title"),
                message: (e as Error).message,
                buttons: [
                  {
                    text: t("auth_provider.fail_accept_invite.retry"),
                    autoFocus: true,
                  },
                  {
                    text: t("auth_provider.fail_accept_invite.ignore"),
                    onClick: () => {
                      tryAgain = false;
                    },
                  },
                ],
              });
            }
            if (!tryAgain) break;
          }
        }

        navigate(search.get("redirect_path") ?? "/", { replace: true });
      } else {
        // special case: auth info passed in URL (e.g. my-profile)
        // save auth params in session storage and remove from URL
        const search = parseUrlParams();
        ["token", "refresh_token", "token_expire"].forEach((key) => {
          const value = search.get(key);
          if (value == null) return;
          sessionStorage.setItem(key, value);
          search.delete(key);
        });
        const newHash = search.toString();
        navigate(
          {
            pathname: location.pathname,
            search: location.search,
            hash: newHash ? "#" + newHash : "",
          },
          { replace: true }
        );
      }

      // check for session
      if (!isSessionValid()) {
        if (optional) {
          // set anonymous user
          setCtx({
            candos: [],
            id: ANONYMOUS_USER_ID,
            company: null,
            department: null,
            email: "anonymous@" + window.location.hostname,
            gender: 0,
            first_name: "Anonymous",
            last_name: "User",
            image: null,
            job_title: null,
            locale: null,
            mobile: null,
            personnel_number: null,
            short: null,
            tenants: [],
            username: "anonymous@" + window.location.hostname,
            updated_at: new Date(),
          });
        } else {
          await destroySession();
          redirectToLogin();
        }
      } else {
        // copy cookies to sessionStorage for faster access
        ["token", "token_expire", "refresh_token"]
          .map((key) => [key, localStorage[key] ?? Cookies.get(key)])
          .filter(([key, value]) => value && !sessionStorage.getItem(key))
          .forEach(([key, value]) =>
            sessionStorage.setItem(key as string, value as string)
          );
        // get user info
        try {
          temporarilyDisableAutoRedirectToLogin = !!props.optional;
          const userInfo = await BackendHttpClient.get<GetCurrentUserResponse>(
            "/api/v1/identity-management/oauth/token/info",
            null
          );
          setCtx({
            ...userInfo.data.attributes,
            updated_at: new Date(),
          });
        } catch (e) {
          const isInvalidToken =
            (e as Error).name === "BackendError" &&
            (e as BackendError).code === "token_invalid";
          console.error(e);
          if (!props.optional && !isInvalidToken) {
            await showInfoDialog(pushDialog, {
              title: t("auth_provider.fail_fetch_profile.title"),
              message: (e as Error).message,
              buttons: [
                {
                  text: t("auth_provider.fail_fetch_profile.retry"),
                  autoFocus: true,
                },
              ],
            });
            window.location.reload();
          }
        } finally {
          temporarilyDisableAutoRedirectToLogin = false;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx]);

  // set current user for sentry
  useEffect(() => {
    if (!ctx) {
      // not authenticated
      Sentry.configureScope((scope) => scope.setUser(null));
      setPerms([]);
    } else {
      Sentry.setUser({
        id: ctx.id,
      });
      setPerms(ctx.candos.map((e) => e.split("/")[1]));
    }
  }, [ctx, setPerms]);

  return ctx ? (
    <AuthProviderResetContext.Provider value={resetAuthContext}>
      <AuthProviderContext.Provider value={ctx}>
        {children}
      </AuthProviderContext.Provider>
    </AuthProviderResetContext.Provider>
  ) : (
    <Loader />
  );
};

export default React.memo(AuthProvider);
