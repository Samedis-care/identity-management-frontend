import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Logout } from "@mui/icons-material";
import {
  Loader,
  useCloseThisDialog,
  useModelDeleteMultiple,
} from "components-care";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  LOGIN_STATUS_LOGGED_OUT,
  useProfileLoginsModel,
} from "../../../components-care/models/ProfileLoginsModel";
import AccountDialog, {
  DialogButtons,
  DialogError,
  Full,
} from "../components/AccountDialog";

/** how many sessions the dialog lists by name, the rest is counted */
const LIST_LIMIT = 5;
/** how many login ids go into one DELETE request URL */
const DELETE_BATCH_SIZE = 50;
/** page size when collecting the sessions to delete */
const PAGE_SIZE = 100;

interface OtherSession {
  id: string;
  device: string;
  location: string;
  created_at: Date | null;
  active: string;
}

/**
 * Lists the other sessions of the user, then signs them all out: active ones
 * and logged-out-but-remembered ones, everything except the current session.
 */
const SignOutOthersDialog = () => {
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  const model = useProfileLoginsModel();
  const { mutateAsync: deleteSessions } = useModelDeleteMultiple(model);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [others, setOthers] = useState<OtherSession[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result: OtherSession[] = [];
      for (let page = 1; page <= 10; ++page) {
        const [rows, meta] = await model.index({ page, rows: PAGE_SIZE });
        result.push(
          ...(
            rows as unknown as (OtherSession & { current: boolean })[]
          ).filter((row) => !row.current),
        );
        if (
          rows.length < PAGE_SIZE ||
          page * PAGE_SIZE >= (meta?.totalRows ?? 0)
        )
          break;
      }
      if (!cancelled) setOthers(result);
    })().catch((e: Error) => {
      if (cancelled) return;
      setOthers([]);
      setError(e.message);
    });
    return () => {
      cancelled = true;
    };
  }, [model]);

  const submit = async () => {
    if (!others?.length) return;
    setBusy(true);
    setError(null);
    try {
      const ids = others.map((session) => session.id);
      // the ids travel in the request URL, so send them in batches
      for (let n = 0; n < ids.length; n += DELETE_BATCH_SIZE) {
        await deleteSessions(ids.slice(n, n + DELETE_BATCH_SIZE));
      }
      close();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const listed = others?.slice(0, LIST_LIMIT) ?? [];
  const more = (others?.length ?? 0) - listed.length;

  return (
    <AccountDialog
      title={t("dialogs.sign-out-others.title")}
      onClose={close}
      onSubmit={submit}
    >
      {!others ? (
        <Full>
          <Loader />
        </Full>
      ) : others.length === 0 ? (
        <Full>
          <Typography>{t("dialogs.sign-out-others.none")}</Typography>
        </Full>
      ) : (
        <>
          <Full>
            <Typography>
              {t("dialogs.sign-out-others.list", { count: others.length })}
            </Typography>
          </Full>
          <Full>
            <Box
              component={"ul"}
              sx={{
                m: 0,
                p: 0,
                listStyle: "none",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {listed.map((session, idx) => (
                <Box
                  component={"li"}
                  key={session.id}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderTop: idx === 0 ? 0 : 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>
                    {session.device}
                    {session.active === LOGIN_STATUS_LOGGED_OUT &&
                      ` (${t("dialogs.sign-out-others.logged-out")})`}
                  </Typography>
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
                </Box>
              ))}
              {more > 0 && (
                <Box
                  component={"li"}
                  sx={{ px: 2, py: 1.25, borderTop: 1, borderColor: "divider" }}
                >
                  <Typography color={"text.secondary"}>
                    {t("dialogs.sign-out-others.more", { count: more })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Full>
          <Full>
            <Typography>{t("dialogs.sign-out-others.text")}</Typography>
          </Full>
        </>
      )}
      <DialogError error={error} />
      <DialogButtons
        label={t("dialogs.sign-out-others.submit")}
        icon={<Logout />}
        color={"error"}
        disabled={!others?.length}
        busy={busy}
        onCancel={close}
      />
    </AccountDialog>
  );
};

export default React.memo(SignOutOthersDialog);
