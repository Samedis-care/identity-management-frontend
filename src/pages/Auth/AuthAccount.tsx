import React, { useCallback, useEffect } from "react";
import { FrameworkHistory } from "components-care";
import {
  AuthFactorType,
  AuthPageProps,
  useAuthPageState,
} from "./components/AuthPageLayout";
import { preserveUrlParams } from "../../utils/preserveUrlParams";
import AuthPassword from "./components/AuthPassword";
import AuthTotp from "./components/AuthTotp";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router";

const AuthAccount = (props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const { app } = params;
  const [state, setState] = useAuthPageState();

  useEffect(() => {
    if (state.activeAccount) return;

    FrameworkHistory.push(preserveUrlParams(`/login/${app}`, location));
  }, [state.activeAccount, app, location]);
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

  const renderForm = useCallback(() => {
    if (state.currentFactor === undefined) return false;
    if (state.currentFactor === AuthFactorType.PASSWORD)
      return <AuthPassword {...props} />;
    if (state.currentFactor === AuthFactorType.TOPT)
      return <AuthTotp {...props} />;
    throw new Error("Unsupported current factor");
  }, [props, state.currentFactor]);

  return <form>{renderForm()}</form>;
};

export default React.memo(AuthAccount);
