import React, { useCallback, useMemo, useState } from "react";
import { Grid, styled, Typography } from "@mui/material";
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
  TextFieldWithHelp,
  useCloseThisDialog,
  useFrontendDownload,
} from "components-care";
import { useTranslation } from "react-i18next";
import { OtpAttributes, useOtpMutation } from "../../../api/ident-services/Otp";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import { sanitizeSvg } from "../../../utils/sanitize";
import { isRegularTotp } from "../../../utils/totpUtils";
import AccountDialog from "../components/AccountDialog";
import DialogButtons from "../components/DialogButtons";
import DialogError from "../components/DialogError";
import DialogRow from "../components/DialogRow";
import { READ_ONLY_SLOT_PROPS } from "../constants";

export interface EnrollTotpDialogProps {
  /** the started enrollment: secret, QR code and backup codes */
  enrollment: OtpAttributes;
}

const ScanRow = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  [theme.breakpoints.only("xs")]: { justifyContent: "center" },
}));

const QrBox = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  backgroundColor: "#FFFFFF",
  width: 196,
  height: 196,
  flexShrink: 0,
  "& > svg": { width: "100%", height: "100%", display: "block" },
}));

const SecretBox = styled("div")({
  flex: "1 1 200px",
});

const SecretField = styled(TextFieldWithHelp)({
  "& .MuiInputBase-input": { fontFamily: "monospace" },
});

const CodesGrid = styled(Grid)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  margin: 0,
}));

const BackupCode = styled(Typography)({
  fontFamily: "monospace",
  fontSize: 15,
});

const CODE_SLOT_PROPS = {
  htmlInput: { inputMode: "numeric", autoComplete: "one-time-code" },
} as const;

/** groups the secret key in blocks of four for typing it by hand */
const groupKey = (key: string) => key.replace(/(.{4})/g, "$1 ").trim();

/**
 * Finishes a started TOTP enrollment in two steps: scan the QR code (or type
 * the key) and confirm a code, then save the backup codes, which are shown
 * only this once.
 */
const EnrollTotpDialog = (props: EnrollTotpDialogProps) => {
  const { enrollment } = props;
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const model = useProfileModel();
  const download = useFrontendDownload();
  const { mutateAsync, isPending, isError, isSuccess } = useOtpMutation();
  const [code, setCode] = useState("");
  const valid = isRegularTotp(code);
  const codes = enrollment.otp_backup_codes;
  const qrCode = useMemo(
    () => ({ __html: sanitizeSvg(enrollment.otp_provisioning_qr_code) }),
    [enrollment.otp_provisioning_qr_code],
  );

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      setCode(evt.target.value.replace(/\D/g, "").slice(0, 6)),
    [],
  );
  const submit = useCallback(async () => {
    if (!valid) return;
    try {
      await mutateAsync({ otp_enable: code });
    } catch {
      // shown as the failure text
      return;
    }
    await model.invalidateCacheForId("singleton");
  }, [code, model, mutateAsync, valid]);
  const downloadCodes = useCallback(() => {
    const host = window.location.hostname;
    download(
      new File(
        [
          t("dialogs.enroll.download-content", {
            BACKUP_CODES: codes.map((entry) => "- " + entry).join("\n"),
            HOSTNAME: host,
          }),
        ],
        t("dialogs.enroll.download-filename", { HOSTNAME: host }),
      ),
    );
  }, [codes, download, t]);
  const copyCodes = useCallback(() => copyText(codes.join("\n")), [codes]);

  // confirmed: the backup codes
  if (isSuccess)
    return (
      <AccountDialog title={t("dialogs.enroll.codes-title")}>
        <DialogRow>
          <InfoBox
            status={"success"}
            heading={t("dialogs.enroll.codes-heading")}
            message={t("dialogs.enroll.codes-text")}
            expanded
          />
        </DialogRow>
        <DialogRow>
          <CodesGrid container spacing={1}>
            {codes.map((entry) => (
              <Grid key={entry} size={{ xs: 6, sm: 3 }}>
                <BackupCode>{entry}</BackupCode>
              </Grid>
            ))}
          </CodesGrid>
        </DialogRow>
        <Grid>
          <ActionButton icon={<Download />} onClick={downloadCodes}>
            {t("dialogs.enroll.download")}
          </ActionButton>
        </Grid>
        <Grid>
          <ActionButton icon={<ContentCopy />} onClick={copyCodes}>
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

  return (
    <AccountDialog title={t("dialogs.enroll.title")} onSubmit={submit}>
      <DialogRow>
        <Typography>{t("dialogs.enroll.step-scan")}</Typography>
      </DialogRow>
      <DialogRow>
        <ScanRow>
          <QrBox
            role={"img"}
            aria-label={t("dialogs.enroll.qr")}
            dangerouslySetInnerHTML={qrCode}
          />
          <SecretBox>
            <SecretField
              label={t("dialogs.enroll.secret")}
              value={groupKey(enrollment.otp_secret_key)}
              slotProps={READ_ONLY_SLOT_PROPS}
              multiline
              disableClearable
              fullWidth
            />
          </SecretBox>
        </ScanRow>
      </DialogRow>
      <DialogRow>
        <Typography>{t("dialogs.enroll.step-code")}</Typography>
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          label={t("dialogs.enroll.code")}
          value={code}
          onChange={handleChange}
          slotProps={CODE_SLOT_PROPS}
          autoFocus
          fullWidth
        />
      </DialogRow>
      <DialogError message={isError ? t("dialogs.enroll.failure") : null} />
      <DialogButtons
        label={t("dialogs.enroll.submit")}
        icon={<PhonelinkLockOutlined />}
        disabled={!valid}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(EnrollTotpDialog);
