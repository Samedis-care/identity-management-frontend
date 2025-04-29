import React, { useCallback, useEffect, useState } from "react";
import { Grid, IconButton, TextField, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AccountManager from "../../utils/AccountManager";
import {
  AuthFactorType,
  AuthPageProps,
  useAuthPageState,
} from "./components/AuthPageLayout";
import { preserveUrlParams } from "../../utils/preserveUrlParams";
import { useTranslation } from "react-i18next";
import {
  ActionButton,
  useNavigate,
  useParams,
  useLocation,
} from "components-care";
import { validateEmailRaw } from "components-care/dist/utils/validations/validateEmail";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  button: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
  },
}));

const AddAccount = (_props: AuthPageProps) => {
  const { classes } = useStyles();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { app } = params;
  if (!app) throw new Error("App not set");
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [, setState] = useAuthPageState();
  useEffect(() => {
    setState((prev) => ({ ...prev, showSocialLogins: true }));
    return () => {
      setState((prev) => ({ ...prev, showSocialLogins: false }));
    };
  }, [setState]);
  const handleEmailChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(evt.target.value);
    },
    [],
  );
  const handleBack = useCallback(
    () => navigate(preserveUrlParams(`/login/${app}`, location)),
    [app, navigate, location],
  );
  const handleNext = useCallback(
    (evt: React.MouseEvent) => {
      evt.preventDefault();
      const account = AccountManager.addAccount({
        id: new Date().toISOString(),
        email,
        name: null,
        avatar: null,
        session: null,
      });
      setState({
        activeAccount: account,
        currentFactor: undefined,
        remainingFactors: [AuthFactorType.PASSWORD],
      });
      navigate(preserveUrlParams(`/login/${app}/authenticate`, location));
    },
    [app, email, setState, location, navigate],
  );
  const handleCreate = useCallback(() => {
    navigate(
      preserveUrlParams(`/login/${app}/create-account`, location, {
        emailHint: email,
      }),
    );
  }, [app, email, location, navigate]);

  return (
    <form>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant={"h1"}>
            <IconButton onClick={handleBack} size="large">
              <ArrowBack />
            </IconButton>
            {t("add.title")}
          </Typography>
        </Grid>
        <Grid size={12}>
          <TextField
            label={t("add.email")}
            name={"email"}
            fullWidth
            value={email}
            onChange={handleEmailChange}
            autoFocus
            autoComplete={"email"}
            variant={"standard"}
          />
        </Grid>
        <Grid size={12}>{t("add.mailhint")}</Grid>
        <Grid size={6}>
          <ActionButton className={classes.button} onClick={handleCreate}>
            {t("add.new")}
          </ActionButton>
        </Grid>
        <Grid size={6}>
          <ActionButton
            type={"submit"}
            onClick={handleNext}
            disabled={!validateEmailRaw(email)}
          >
            {t("add.next")}
          </ActionButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(AddAccount);
