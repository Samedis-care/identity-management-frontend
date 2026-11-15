import React, { useEffect, useState } from "react";
import { Box, Grid, styled, Typography } from "@mui/material";
import {
  ContentCopy,
  Download,
  PhonelinkLockOutlined,
} from "@mui/icons-material";
import {
  ActionButton,
  BackActionButton,
  copyText,
  InfoBox,
  Loader,
  TextFieldWithHelp,
  useCloseThisDialog,
  useFrontendDownload,
} from "components-care";
import { useTranslation } from "react-i18next";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { DataResponse } from "../../../api/ident-services/Common";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import useAccountApp from "../../../utils/useAccountApp";
import { sanitizeSvg } from "../../../utils/sanitize";
import { isRegularTotp } from "../../../utils/totpUtils";
import AccountDialog, {
  DialogButtons,
  DialogError,
  Full,
} from "../components/AccountDialog";

export type OtpResponse = DataResponse<{
  attributes: {
    otp_enabled: boolean;
    otp_provisioning_qr_code: string;
    otp_secret_key: string;
    otp_backup_codes: string[];
  };
}>;

/** PUT on the user of the app the page was opened from, so the authenticator entry carries its name */
export const putOtp = async (app: string, data: Record<string, string>) =>
  (
    await BackendHttpClient.put<OtpResponse>(`/api/v1/${app}/user`, null, {
      data,
    })
  ).data.attributes;

const QrBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  backgroundColor: "#FFFFFF",
  width: 196,
  height: 196,
  flexShrink: 0,
  "& > svg": { width: "100%", height: "100%", display: "block" },
}));

const mono = { input: { readOnly: true, sx: { fontFamily: "monospace" } } };

/** groups the secret key in blocks of four for typing it by hand */
const groupKey = (key: string) => key.replace(/(.{4})/g, "$1 ").trim();

/**
 * Sets up TOTP in two steps: scan the QR code (or type the key) and confirm a
 * code, then save the backup codes, which are shown only this once.
 */
const EnrollTotpDialog = () => {
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const app = useAccountApp();
  const model = useProfileModel();
  const download = useFrontendDownload();
  const [enrollment, setEnrollment] = useState<Awaited<
    ReturnType<typeof putOtp>
  > | null>(null);
  const [step, setStep] = useState<"scan" | "codes">("scan");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = !!enrollment && isRegularTotp(code);

  // starts the enrollment: the backend creates the secret and the QR code
  useEffect(() => {
    let cancelled = false;
    putOtp(app, { otp_enable: "true" })
      .then((result) => !cancelled && setEnrollment(result))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [app]);

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const result = await putOtp(app, { otp_enable: code });
      if (!result.otp_enabled) throw new Error(t("dialogs.enroll.failure"));
      await model.invalidateCacheForId("singleton");
      setStep("codes");
    } catch (_e) {
      setError(t("dialogs.enroll.failure"));
    } finally {
      setBusy(false);
    }
  };

  if (step === "codes" && enrollment) {
    const codes = enrollment.otp_backup_codes;
    const host = window.location.hostname;
    return (
      <AccountDialog title={t("dialogs.enroll.codes-title")} onClose={close}>
        <Full>
          <InfoBox
            status={"success"}
            heading={t("dialogs.enroll.codes-heading")}
            message={t("dialogs.enroll.codes-text")}
            expanded
          />
        </Full>
        <Full>
          <Grid
            container
            spacing={1}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              m: 0,
            }}
          >
            {codes.map((entry) => (
              <Grid key={entry} size={{ xs: 6, sm: 3 }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: 15 }}>
                  {entry}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Full>
        <Grid>
          <ActionButton
            icon={<Download />}
            onClick={() =>
              download(
                new File(
                  [
                    t("dialogs.enroll.download-content", {
                      BACKUP_CODES: codes.map((c) => "- " + c).join("\n"),
                      HOSTNAME: host,
                    }),
                  ],
                  t("dialogs.enroll.download-filename", { HOSTNAME: host }),
                ),
              )
            }
          >
            {t("dialogs.enroll.download")}
          </ActionButton>
        </Grid>
        <Grid>
          <ActionButton
            icon={<ContentCopy />}
            onClick={() => copyText(codes.join("\n"))}
          >
            {t("dialogs.enroll.copy")}
          </ActionButton>
        </Grid>
        <Grid>
          <BackActionButton onClick={close}>
            {t("dialogs.enroll.done")}
          </BackActionButton>
        </Grid>
      </AccountDialog>
    );
  }

  return (
    <AccountDialog
      title={t("dialogs.enroll.title")}
      onClose={close}
      onSubmit={submit}
    >
      {enrollment ? (
        <>
          <Full>
            <Typography>{t("dialogs.enroll.step-scan")}</Typography>
          </Full>
          <Full>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              <QrBox
                role={"img"}
                aria-label={"QR"}
                dangerouslySetInnerHTML={{
                  __html: sanitizeSvg(enrollment.otp_provisioning_qr_code),
                }}
              />
              <Box sx={{ flex: "1 1 200px" }}>
                <TextFieldWithHelp
                  label={t("dialogs.enroll.secret")}
                  value={groupKey(enrollment.otp_secret_key)}
                  slotProps={mono}
                  multiline
                  disableClearable
                  fullWidth
                />
              </Box>
            </Box>
          </Full>
          <Full>
            <Typography>{t("dialogs.enroll.step-code")}</Typography>
          </Full>
          <Full>
            <TextFieldWithHelp
              label={t("dialogs.enroll.code")}
              value={code}
              onChange={(evt) =>
                setCode(evt.target.value.replace(/\D/g, "").slice(0, 6))
              }
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                  autoComplete: "one-time-code",
                },
              }}
              autoFocus
              fullWidth
            />
          </Full>
          <DialogError error={error} />
          <DialogButtons
            label={t("dialogs.enroll.submit")}
            icon={<PhonelinkLockOutlined />}
            disabled={!valid}
            busy={busy}
            onCancel={close}
          />
        </>
      ) : error ? (
        <>
          <DialogError error={error} />
          <DialogButtons
            label={t("dialogs.enroll.submit")}
            icon={<PhonelinkLockOutlined />}
            disabled
            onCancel={close}
          />
        </>
      ) : (
        <Full>
          <Loader />
        </Full>
      )}
    </AccountDialog>
  );
};

export default React.memo(EnrollTotpDialog);
