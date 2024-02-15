import React, { useCallback, useEffect } from "react";
import {
  AuthFactorType,
  AuthPageProps,
  useAuthPageAppInfo,
  useAuthPageState,
} from "./components/AuthPageLayout";
import { preserveUrlParams } from "../../utils/preserveUrlParams";
import AuthPassword from "./components/AuthPassword";
import AuthTotp from "./components/AuthTotp";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router";
import { md5 } from "js-md5";
import { doOauthSignIn } from "./components/SocialLogins";
import getEmailDomain from "../../utils/getEmailDomain";

const AuthAccount = (props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { app } = params;
  const [state, setState] = useAuthPageState();
  const appInfo = useAuthPageAppInfo();

  useEffect(() => {
    if (state.activeAccount) return;

    navigate(preserveUrlParams(`/login/${app}`, location));
  }, [state.activeAccount, app, location, navigate]);
  useEffect(() => {
    if (state.currentFactor) return;
    if (state.remainingFactors.length === 0) {
      if (!state.redirectURL)
        throw new Error("Redirect URL not set, but no remaining auth factors");
      window.location.href = state.redirectURL;
      return;
    }

    setState((prev) => ({
      ...prev,
      currentFactor: prev.remainingFactors[0],
      remainingFactors: prev.remainingFactors.slice(1),
    }));
  }, [
    setState,
    state.currentFactor,
    state.redirectURL,
    state.remainingFactors.length,
  ]);

  // custom oauth
  useEffect(() => {
    if (!state.activeAccount) return;
    const emailDomain = getEmailDomain(state.activeAccount.email);
    if (!appInfo.auth_provider_hints.includes(md5(emailDomain))) return;
    if (!app) throw new Error("app null");
    doOauthSignIn(emailDomain, app, location, state.activeAccount.email);
    setState((prev) => ({
      ...prev,
      currentFactor: AuthFactorType.EXTERNAL_OAUTH,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInfo.auth_provider_hints, state.activeAccount]);

  const renderForm = useCallback(() => {
    if (state.currentFactor === undefined) return false;
    if (state.currentFactor === AuthFactorType.EXTERNAL_OAUTH) return false;
    if (state.currentFactor === AuthFactorType.PASSWORD)
      return <AuthPassword {...props} />;
    if (state.currentFactor === AuthFactorType.TOPT)
      return <AuthTotp {...props} />;
    throw new Error("Unsupported current factor");
  }, [props, state.currentFactor]);

  return <form>{renderForm()}</form>;
};

export default React.memo(AuthAccount);
