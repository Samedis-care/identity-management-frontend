import React, { useCallback, useState } from "react";
import {
  Grid,
  IconButton,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import { ActionButton } from "components-care";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import AccountManager from "../../utils/AccountManager";
import {
  AuthFactorType,
  AuthPageProps,
  useAuthPageState,
} from "./components/AuthPageLayout";
import { preserveUrlParams } from "../../utils/preserveUrlParams";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { validateEmailRaw } from "components-care/dist/utils/validations/validateEmail";

const AddAccount = (props: AuthPageProps) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { app } = params;
  if (!app) throw new Error("App not set");
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [, setState] = useAuthPageState();
  const handleEmailChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(evt.target.value);
    },
    []
  );
  const handleBack = useCallback(
    () => navigate(`/login/${app}`),
    [app, navigate]
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
    [app, email, setState, location, navigate]
  );

  return (
    <form>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant={"h1"}>
            <IconButton onClick={handleBack} size="large">
              <ArrowBack />
            </IconButton>
            {t("add.title")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
        <Grid item xs={6}>
          <ActionButton
            type={"submit"}
            onClick={handleNext}
            disabled={!validateEmailRaw(email)}
          >
            {t("add.next")}
          </ActionButton>
        </Grid>
        <Grid item xs={12}>
          <MuiLink
            component={Link}
            to={preserveUrlParams(`/login/${app}/create-account`, location, {
              emailHint: email,
            })}
          >
            {t("add.new")}
          </MuiLink>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(AddAccount);
