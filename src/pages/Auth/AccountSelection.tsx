import React, { useCallback, useEffect, useState } from "react";
import { Typography, Grid2 as Grid } from "@mui/material";
import AccountEntry from "./components/AccountEntry";
import AccountListButton from "./components/AccountListButton";
import { Add as AddIcon } from "@mui/icons-material";
import {
  AuthFactorType,
  AuthPageProps,
  useAuthPageState,
} from "./components/AuthPageLayout";
import AccountManager from "../../utils/AccountManager";
import { preserveUrlParams } from "../../utils/preserveUrlParams";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { OauthTokenResponse } from "../../api/ident-services/Auth";
import * as Sentry from "@sentry/react";
import downloadProfileImage from "../../utils/downloadProfileImage";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "components-care";

const AccountSelection = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { app } = params;
  const { t } = useTranslation("auth");

  const onAddNewAccount = useCallback(
    () => navigate(preserveUrlParams(`/login/${app}/add-account`, location)),
    [app, location, navigate],
  );
  const [, setState] = useAuthPageState();
  useEffect(() => {
    setState((prev) => ({ ...prev, showSocialLogins: true }));
    return () => {
      setState((prev) => ({ ...prev, showSocialLogins: false }));
    };
  }, [setState]);

  const [, setRefreshToken] = useState("");
  const onSelectAccount = useCallback(
    async (id: string) => {
      let account = AccountManager.forceFind(id);
      if (account.session?.refresh) {
        try {
          const resp = await BackendHttpClient.post<OauthTokenResponse>(
            `/api/v1/${app}/oauth/token`,
            null,
            {
              ...Object.fromEntries(
                new URLSearchParams(location.search).entries(),
              ),
              grant_type: "refresh_token",
              refresh_token: account.session.refresh,
            },
            AuthMode.Off,
          );
          const image =
            resp.data.attributes.image.small &&
            (await downloadProfileImage(resp.data.attributes.image.small));
          const expires = new Date(Date.now() + resp.meta.expires_in * 1000);
          account = AccountManager.updateAccount({
            id: resp.data.attributes.id,
            email: resp.data.attributes.email,
            name: [
              resp.data.attributes.first_name,
              resp.data.attributes.last_name,
            ]
              .filter((x) => x)
              .join(" "),
            avatar: image,
            session: {
              token: resp.meta.token,
              refresh: resp.meta.refresh_token,
              until: expires,
            },
          });
          if (!resp.meta.redirect_url) {
            Sentry.captureException(
              new Error("redirect_url not present in backend response"),
            );
          }
          sessionStorage.setItem("token", resp.meta.token); // set session here to allow 2FA
          sessionStorage.setItem("token_expire", expires.toISOString());
          setState((prev) => ({
            ...prev,
            remainingFactors: AccountManager.getAuthFactors(resp),
            redirectURL: resp.meta.redirect_url!,
          }));
        } catch (_e) {
          // login failure, update account
          account = AccountManager.updateAccount({
            id: account.id,
            email: account.email,
            session: null,
          });
          setState((prev) => ({
            ...prev,
            remainingFactors: [AuthFactorType.PASSWORD],
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          remainingFactors: [AuthFactorType.PASSWORD],
        }));
      }
      setState((prev) => ({
        ...prev,
        activeAccount: account,
        currentFactor: undefined,
      }));
      navigate(preserveUrlParams(`/login/${app}/authenticate`, location));
    },
    [setState, app, location, navigate],
  );
  const onForgotAccount = (id: string) => {
    const account = AccountManager.forceFind(id);
    if (account.session) {
      if (account.session.token) {
        void fetch("/api/v1/oauth/revoke", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + account.session.token,
          },
        });
      }
    }
    AccountManager.forgetAccount(id);
    setRefreshToken(id);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant={"h1"}>{t("select.title")}</Typography>
      </Grid>
      {AccountManager.getAccounts().map((account) => (
        <AccountEntry
          id={account.id ?? account.email}
          name={account.name ?? account.email}
          email={account.email}
          avatar={account.avatar}
          status={t(account.session ? "select.signed-in" : "select.signed-out")}
          key={account.id ?? account.email}
          onClick={onSelectAccount}
          onForgotAccount={onForgotAccount}
        />
      ))}
      <AccountListButton
        icon={<AddIcon />}
        text={AccountManager.isEmpty() ? t("select.first") : t("select.other")}
        onClick={onAddNewAccount}
      />
    </Grid>
  );
};

export default React.memo(AccountSelection);
