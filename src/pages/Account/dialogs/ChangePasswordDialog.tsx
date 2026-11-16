import React, { useState } from "react";
import { KeyOutlined } from "@mui/icons-material";
import {
  InfoBox,
  showInfoDialog,
  TextFieldWithHelp,
  useCloseThisDialog,
  useDialogContext,
  useModelMutation,
} from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountDialog, {
  DialogButtons,
  DialogError,
  Full,
} from "../components/AccountDialog";

const MIN_LENGTH = 8;

/** changes the password; the backend signs out every other session */
const ChangePasswordDialog = () => {
  const { t } = useTranslation("account");
  const [pushDialog] = useDialogContext();
  const close = useCloseThisDialog();
  const model = useProfileModel();
  const { mutateAsync: updateProfile } = useModelMutation(model);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mismatch = !!repeat && next !== repeat;
  const valid = !!current && next.length >= MIN_LENGTH && next === repeat;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile({
        id: "singleton",
        current_password: current,
        password: next,
        password_confirmation: repeat,
      });
      close();
      showInfoDialog(pushDialog, {
        title: t("dialogs.password.success-title"),
        message: t("dialogs.password.success"),
      });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <AccountDialog
      title={t("dialogs.password.title")}
      onClose={close}
      onSubmit={submit}
    >
      <Full>
        <TextFieldWithHelp
          label={t("dialogs.password.current")}
          type={"password"}
          autoComplete={"current-password"}
          value={current}
          onChange={(evt) => setCurrent(evt.target.value)}
          autoFocus
          fullWidth
        />
      </Full>
      <Full>
        <TextFieldWithHelp
          label={t("dialogs.password.new")}
          type={"password"}
          autoComplete={"new-password"}
          value={next}
          onChange={(evt) => setNext(evt.target.value)}
          helperText={t("dialogs.password.new-help")}
          fullWidth
        />
      </Full>
      <Full>
        <TextFieldWithHelp
          label={t("dialogs.password.repeat")}
          type={"password"}
          autoComplete={"new-password"}
          value={repeat}
          onChange={(evt) => setRepeat(evt.target.value)}
          error={mismatch}
          helperText={mismatch ? t("dialogs.password.mismatch") : " "}
          fullWidth
        />
      </Full>
      <Full>
        <InfoBox
          status={"info"}
          heading={t("dialogs.password.info-heading")}
          message={t("dialogs.password.info")}
          expanded
        />
      </Full>
      <DialogError error={error} />
      <DialogButtons
        label={t("dialogs.password.submit")}
        icon={<KeyOutlined />}
        disabled={!valid}
        busy={busy}
        onCancel={close}
      />
    </AccountDialog>
  );
};

export default React.memo(ChangePasswordDialog);
