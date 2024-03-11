import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Grid,
  IconButton,
  Link,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ActionButton,
  Loader,
  showInfoDialog,
  sleep,
  useDialogContext,
  useNavigate,
  useParams,
  useLocation,
} from "components-care";
import { ArrowBack, KeyboardArrowRight } from "@mui/icons-material";
import Recaptcha from "react-recaptcha";
import { validateEmailRaw } from "components-care/dist/utils/validations/validateEmail";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import {
  AuthPageProps,
  useAuthPageAppInfo,
  useAuthPageState,
} from "./components/AuthPageLayout";
import AccountManager from "../../utils/AccountManager";
import { Trans, useTranslation } from "react-i18next";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import PolicyViewer from "../../components/PolicyViewer";
import { preserveUrlParams } from "../../utils/preserveUrlParams";
import getEmailDomain from "../../utils/getEmailDomain";
import { md5 } from "js-md5";
import { doOauthSignIn } from "./components/SocialLogins";

const { REACT_APP_RECAPTCHA_KEY } = process.env;

const isRecaptchaReady = () =>
  typeof window !== "undefined" &&
  // @ts-expect-error global vars
  typeof window.grecaptcha !== "undefined" &&
  // @ts-expect-error global vars
  typeof window.grecaptcha.render === "function";

const WaitForRecaptcha = (props: { children: React.ReactElement }) => {
  if (!isRecaptchaReady())
    throw (async () => {
      while (!isRecaptchaReady()) await sleep(300);
    })();
  return props.children;
};

const CreateAccount = (_props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const { app } = params;
  const { t } = useTranslation("auth");
  const [pushDialog] = useDialogContext();
  const appInfo = useAuthPageAppInfo();
  const [state, setState] = useState({
    email: queryParams.get("emailHint") ?? "",
    email_confirm: queryParams.get("emailConfirmHint") ?? "",
    first_name: queryParams.get("firstNameHint") ?? "",
    last_name: queryParams.get("lastNameHint") ?? "",
    password: "",
    password_confirm: "",
    captcha: "",
  });
  const theme = useTheme();

  const [, setAuthPageState] = useAuthPageState();
  useEffect(() => {
    setAuthPageState((prev) => ({ ...prev, showSocialLogins: true }));
    return () => {
      setAuthPageState((prev) => ({ ...prev, showSocialLogins: false }));
    };
  }, [setAuthPageState]);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({
        ...prev,
        [evt.target.name]: evt.target.value,
      }));
    },
    [],
  );
  const recaptchaCallback = useCallback((response: string) => {
    setState((prev) => ({ ...prev, captcha: response }));
  }, []);
  const recaptchaExpireCallback = useCallback(() => {
    setState((prev) => ({ ...prev, captcha: "" }));
  }, []);
  const handleBack = useCallback(
    () => navigate(preserveUrlParams(`/login/${app}/add-account`, location)),
    [app, navigate, location],
  );

  const showPrivacyDialog = useCallback(() => {
    pushDialog(<PolicyViewer document={"tos-privacy"} />);
  }, [pushDialog]);

  // load recaptcha script dynamically
  useEffect(() => {
    if (!REACT_APP_RECAPTCHA_KEY) return;
    const recaptcha = document.createElement("script");
    recaptcha.src = "https://www.google.com/recaptcha/api.js";
    recaptcha.async = true;
    recaptcha.defer = true;
    document.body.appendChild(recaptcha);

    return () => {
      document.body.removeChild(recaptcha);
    };
  }, []);

  const captcha = useRef<Recaptcha | null>(null);

  const handleSubmit = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();

      if (state.email !== state.email_confirm) {
        await showInfoDialog(pushDialog, {
          title: t("create.validations.email-mismatch.title"),
          message: t("create.validations.email-mismatch.message"),
        });
        return;
      }

      if (!validateEmailRaw(state.email)) {
        await showInfoDialog(pushDialog, {
          title: t("create.validations.email-valid.title"),
          message: t("create.validations.email-valid.message"),
        });
        return;
      }

      const emailDomain = getEmailDomain(state.email);
      console.log(emailDomain, md5(emailDomain), appInfo.auth_provider_hints);
      if (appInfo.auth_provider_hints.includes(md5(emailDomain))) {
        // email has custom auth provider
        if (!app) throw new Error("app null");
        await showInfoDialog(pushDialog, {
          title: t("create.validations.email-custom-auth.title"),
          message: t("create.validations.email-custom-auth.message"),
        });
        AccountManager.addAccount({
          id: null,
          email: state.email,
          name: null,
          avatar: null,
          session: null,
        });
        doOauthSignIn(emailDomain, app, location, state.email);
        return;
      }

      if (state.password !== state.password_confirm) {
        await showInfoDialog(pushDialog, {
          title: t("create.validations.password-mismatch.title"),
          message: t("create.validations.password-mismatch.message"),
        });
        return;
      }

      if (REACT_APP_RECAPTCHA_KEY && !state.captcha) {
        await showInfoDialog(pushDialog, {
          title: t("create.validations.captcha.title"),
          message: t("create.validations.captcha.message"),
        });
        return;
      }

      try {
        const resp = await BackendHttpClient.post<{
          meta: { msg: { message: string; thanks_message: string } };
        }>(
          `/api/v1/${app}/register`,
          null,
          {
            ...Object.fromEntries(
              new URLSearchParams(location.search).entries(),
            ),
            email: state.email,
            email_confirmation: state.email_confirm,
            password: state.password,
            password_confirmation: state.password_confirm,
            first_name: state.first_name,
            last_name: state.last_name,
            captcha: REACT_APP_RECAPTCHA_KEY ? state.captcha : undefined,
          },
          AuthMode.Off,
        );

        // TODO: can we fill this with more info?
        AccountManager.addAccount({
          id: null,
          email: state.email,
          name: `${state.first_name} ${state.last_name}`,
          avatar: null,
          session: null,
        });

        await showInfoDialog(pushDialog, {
          title: t("create.result.success.title"),
          message: (
            <div>
              <p>{resp.meta.msg.message}</p>
              <p>{resp.meta.msg.thanks_message}</p>
            </div>
          ),
          buttons: [
            {
              text: t("create.result.success.btn.ok"),
              autoFocus: true,
            },
          ],
        });
        navigate(preserveUrlParams(`/login/${app}`, location));
      } catch (e) {
        await showInfoDialog(pushDialog, {
          title: t("create.result.failed.title"),
          message: (e as Error).message,
        });
      }

      captcha.current?.reset();
    },
    [
      state.email,
      state.email_confirm,
      state.password,
      state.password_confirm,
      state.captcha,
      state.first_name,
      state.last_name,
      appInfo.auth_provider_hints,
      pushDialog,
      t,
      app,
      location,
      navigate,
    ],
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant={"h1"}>
            <IconButton onClick={handleBack} size="large">
              <ArrowBack />
            </IconButton>
            {t("create.title")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("create.email")}
            name={"email"}
            fullWidth
            value={state.email}
            onChange={handleChange}
            autoComplete={"off"}
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("create.email_confirm")}
            name={"email_confirm"}
            fullWidth
            value={state.email_confirm}
            onChange={handleChange}
            autoComplete={"off"}
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={t("create.first_name")}
            name={"first_name"}
            fullWidth
            value={state.first_name}
            onChange={handleChange}
            autoComplete={"given-name"}
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={t("create.last_name")}
            name={"last_name"}
            fullWidth
            value={state.last_name}
            onChange={handleChange}
            autoComplete={"family-name"}
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("create.password")}
            name={"password"}
            fullWidth
            value={state.password}
            onChange={handleChange}
            type={"password"}
            autoComplete={"new-password"}
            variant={"standard"}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("create.password_confirm")}
            name={"password_confirm"}
            fullWidth
            value={state.password_confirm}
            onChange={handleChange}
            type={"password"}
            autoComplete={"new-password"}
            variant={"standard"}
          />
        </Grid>
        {REACT_APP_RECAPTCHA_KEY && (
          <Grid item xs={12}>
            <Suspense fallback={<Loader />}>
              <WaitForRecaptcha>
                <Recaptcha
                  sitekey={REACT_APP_RECAPTCHA_KEY}
                  ref={(e) => (captcha.current = e)}
                  theme={theme.palette.mode}
                  verifyCallback={recaptchaCallback}
                  expiredCallback={recaptchaExpireCallback}
                />
              </WaitForRecaptcha>
            </Suspense>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography>
            <Trans
              t={t}
              i18nKey={"create.tos"}
              components={{
                "link-privacy": <Link href={"#"} onClick={showPrivacyDialog} />,
              }}
            />
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ActionButton
            icon={<KeyboardArrowRight />}
            type={"submit"}
            onClick={handleSubmit}
          >
            {t("create.register")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(CreateAccount);
