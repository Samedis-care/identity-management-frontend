import React, { useCallback, useState } from "react";
import { Typography } from "@mui/material";
import { PhonelinkLockOutlined } from "@mui/icons-material";
import { TextFieldWithHelp, useCloseThisDialog } from "components-care";
import { useTranslation } from "react-i18next";
import { useOtpMutation } from "../../../api/ident-services/Otp";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import { isValidTotp, stripInvalidTotpChars } from "../../../utils/totpUtils";
import AccountDialog from "../components/AccountDialog";
import DialogButtons from "../components/DialogButtons";
import DialogError from "../components/DialogError";
import DialogRow from "../components/DialogRow";

const CODE_SLOT_PROPS = { htmlInput: { autoComplete: "one-time-code" } };

/** turns TOTP off after a code from the app or a backup code */
const UnrollTotpDialog = () => {
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const model = useProfileModel();
  const { mutateAsync, isPending, isError } = useOtpMutation();
  const [code, setCode] = useState("");
  const valid = isValidTotp(code);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      setCode(stripInvalidTotpChars(evt.target.value.toUpperCase())),
    [],
  );
  const submit = useCallback(async () => {
    if (!valid) return;
    try {
      await mutateAsync({ otp_disable: code });
    } catch {
      // shown as the failure text
      return;
    }
    await model.invalidateCacheForId("singleton");
    close();
  }, [close, code, model, mutateAsync, valid]);

  return (
    <AccountDialog title={t("dialogs.unroll.title")} onSubmit={submit}>
      <DialogRow>
        <Typography>{t("dialogs.unroll.text")}</Typography>
      </DialogRow>
      <DialogRow>
        <TextFieldWithHelp
          label={t("dialogs.unroll.code")}
          value={code}
          onChange={handleChange}
          slotProps={CODE_SLOT_PROPS}
          autoFocus
          fullWidth
        />
      </DialogRow>
      <DialogError message={isError ? t("dialogs.unroll.failure") : null} />
      <DialogButtons
        label={t("dialogs.unroll.submit")}
        icon={<PhonelinkLockOutlined />}
        color={"error"}
        disabled={!valid}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(UnrollTotpDialog);
