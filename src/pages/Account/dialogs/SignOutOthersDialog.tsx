import React, { useCallback, useMemo } from "react";
import { styled, Typography } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import {
  Loader,
  useCloseThisDialog,
  useModelDeleteMultiple,
  useModelFetchAll,
} from "components-care";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  LOGIN_STATUS_LOGGED_OUT,
  useProfileLoginsModel,
} from "../../../components-care/models/ProfileLoginsModel";
import AccountDialog from "../components/AccountDialog";
import DialogButtons from "../components/DialogButtons";
import DialogError from "../components/DialogError";
import DialogRow from "../components/DialogRow";

/** how many sessions the dialog lists by name, the rest is counted */
const LIST_LIMIT = 5;
/** how many login ids go into one DELETE request URL */
const DELETE_BATCH_SIZE = 50;
// a fresh list on every open: the deletes don't invalidate the fetch-all
// cache, so a kept list would show signed-out sessions and miss new ones
const FRESH_LIST = { gcTime: 0 };

export interface SignOutOthersDialogProps {
  /** called after the other sessions were signed out */
  onSignedOut?: () => void;
}

const SessionList = styled("ul")(({ theme }) => ({
  margin: 0,
  padding: 0,
  listStyle: "none",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  "& > li": {
    padding: theme.spacing(1.25, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  "& > li:first-of-type": { borderTop: 0 },
}));

const Device = styled(Typography)({
  fontWeight: 500,
});

/**
 * Lists the other sessions of the user, then signs them all out: active ones
 * and logged-out-but-remembered ones, everything except the current session.
 */
const SignOutOthersDialog = (props: SignOutOthersDialogProps) => {
  const { onSignedOut } = props;
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const model = useProfileLoginsModel();
  const {
    data,
    isLoading,
    error: loadError,
  } = useModelFetchAll(model, undefined, FRESH_LIST);
  const { mutateAsync: deleteSessions } = useModelDeleteMultiple(model);
  const others = useMemo(
    () => (data ? data[0].filter((session) => !session.current) : []),
    [data],
  );
  const {
    mutateAsync: signOut,
    isPending,
    error: signOutError,
  } = useMutation({
    mutationFn: async (ids: string[]) => {
      // the ids travel in the request URL, so send them in batches
      for (let n = 0; n < ids.length; n += DELETE_BATCH_SIZE) {
        await deleteSessions(ids.slice(n, n + DELETE_BATCH_SIZE));
      }
    },
  });

  const submit = useCallback(async () => {
    if (!others.length) return;
    try {
      await signOut(others.map((session) => session.id));
    } catch {
      // shown through the mutation's error
      return;
    }
    onSignedOut?.();
    close();
  }, [close, onSignedOut, others, signOut]);

  const listed = others.slice(0, LIST_LIMIT);
  const more = others.length - listed.length;

  return (
    <AccountDialog title={t("dialogs.sign-out-others.title")} onSubmit={submit}>
      {isLoading ? (
        <DialogRow>
          <Loader />
        </DialogRow>
      ) : others.length === 0 ? (
        !loadError && (
          <DialogRow>
            <Typography>{t("dialogs.sign-out-others.none")}</Typography>
          </DialogRow>
        )
      ) : (
        <>
          <DialogRow>
            <Typography>
              {t("dialogs.sign-out-others.list", { count: others.length })}
            </Typography>
          </DialogRow>
          <DialogRow>
            <SessionList>
              {listed.map((session) => (
                <li key={session.id}>
                  <Device>
                    {session.device}
                    {session.active === LOGIN_STATUS_LOGGED_OUT &&
                      ` (${t("dialogs.sign-out-others.logged-out")})`}
                  </Device>
                  <Typography variant={"body2"} color={"text.secondary"}>
                    {[
                      session.location,
                      session.created_at &&
                        t("dialogs.sign-out-others.since", {
                          DATE: moment(session.created_at).format("L LT"),
                        }),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Typography>
                </li>
              ))}
              {more > 0 && (
                <li>
                  <Typography color={"text.secondary"}>
                    {t("dialogs.sign-out-others.more", { count: more })}
                  </Typography>
                </li>
              )}
            </SessionList>
          </DialogRow>
          <DialogRow>
            <Typography>{t("dialogs.sign-out-others.text")}</Typography>
          </DialogRow>
        </>
      )}
      <DialogError message={(loadError ?? signOutError)?.message} />
      <DialogButtons
        label={t("dialogs.sign-out-others.submit")}
        icon={<Logout />}
        color={"error"}
        disabled={!others.length}
        busy={isPending}
      />
    </AccountDialog>
  );
};

export default React.memo(SignOutOthersDialog);
