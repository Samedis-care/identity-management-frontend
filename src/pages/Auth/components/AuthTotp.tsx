import React, { useCallback, useState } from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { AuthPageProps, useAuthPageState } from "./AuthPageLayout";
import {
  ActionButton,
  showInfoDialog,
  useDialogContext,
} from "components-care";
import { isValidTotp, stripInvalidTotpChars } from "../../../utils/totpUtils";

const AuthTotp = (_props: AuthPageProps) => {
  const [pushDialog] = useDialogContext();
  const [state, setState] = useAuthPageState();
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation("auth");

  const [otp, setOtp] = useState("");
  const handleOtpChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setOtp(stripInvalidTotpChars(evt.target.value));
    },
    [],
  );

  const handleNext = useCallback(
    async (evt: React.MouseEvent) => {
      evt.preventDefault();
      try {
        setBusy(true);
        await BackendHttpClient.post("/api/v1/user/authenticate_otp", null, {
          data: {
            authenticate_otp: otp,
          },
        });
        setState((prev) => ({
          ...prev,
          currentFactor: undefined,
        }));
      } catch (e) {
        console.error(e);
        await showInfoDialog(pushDialog, {
          title: t("auth.error"),
          message: (e as Error).message,
        });
      } finally {
        setBusy(false);
      }
    },
    [setState, pushDialog, t, otp],
  );

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant={"h1"}>{t("auth.totp.enter.title")}</Typography>
      </Grid>
      <Grid size={12}>
        <TextField
          label={t("add.email")}
          name={"email"}
          type={"text"}
          fullWidth
          autoFocus
          value={state.activeAccount?.email ?? ""}
          disabled
          variant={"standard"}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t("auth.totp.enter.totp")}
          name={"totp"}
          fullWidth
          autoFocus
          variant={"standard"}
          value={otp}
          onChange={handleOtpChange}
        />
      </Grid>
      <Grid size={12}>
        <ActionButton
          icon={<KeyboardArrowRight />}
          type={"submit"}
          onClick={handleNext}
          disabled={!isValidTotp(otp) || busy}
        >
          {t("auth.password.enter.next")}
        </ActionButton>
      </Grid>
    </Grid>
  );
};

export default React.memo(AuthTotp);
