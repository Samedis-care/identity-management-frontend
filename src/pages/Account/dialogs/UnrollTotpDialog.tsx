import React, { useState } from "react";
import { Typography } from "@mui/material";
import { PhonelinkLockOutlined } from "@mui/icons-material";
import { TextFieldWithHelp, useCloseThisDialog } from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import useAccountApp from "../../../utils/useAccountApp";
import { isValidTotp, stripInvalidTotpChars } from "../../../utils/totpUtils";
import AccountDialog, {
  DialogButtons,
  DialogError,
  Full,
} from "../components/AccountDialog";
import { putOtp } from "./EnrollTotpDialog";

/** turns TOTP off after a code from the app or a backup code */
const UnrollTotpDialog = () => {
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const app = useAccountApp();
  const model = useProfileModel();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = isValidTotp(code);

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const result = await putOtp(app, { otp_disable: code });
      if (result.otp_enabled) throw new Error("TOTP still enabled");
      await model.invalidateCacheForId("singleton");
      close();
    } catch (_e) {
      setError(t("dialogs.unroll.failure"));
      setBusy(false);
    }
  };

  return (
    <AccountDialog
      title={t("dialogs.unroll.title")}
      onClose={close}
      onSubmit={submit}
    >
      <Full>
        <Typography>{t("dialogs.unroll.text")}</Typography>
      </Full>
      <Full>
        <TextFieldWithHelp
          label={t("dialogs.unroll.code")}
          value={code}
          onChange={(evt) =>
            setCode(stripInvalidTotpChars(evt.target.value.toUpperCase()))
          }
          slotProps={{ htmlInput: { autoComplete: "one-time-code" } }}
          autoFocus
          fullWidth
        />
      </Full>
      <DialogError error={error} />
      <DialogButtons
        label={t("dialogs.unroll.submit")}
        icon={<PhonelinkLockOutlined />}
        color={"error"}
        disabled={!valid}
        busy={busy}
        onCancel={close}
      />
    </AccountDialog>
  );
};

export default React.memo(UnrollTotpDialog);
