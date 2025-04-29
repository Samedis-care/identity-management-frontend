import React, { useCallback, useState } from "react";
import { Loader, useDialogContext, useModelGet } from "components-care";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useTranslation } from "react-i18next";
import { useTenantModel } from "../../../../../components-care/models/TenantModel";

export interface TenantDeleteConfirmDialogProps {
  id: string | null;
  multiDelete: boolean;
  tenantModel: ReturnType<typeof useTenantModel>;
  onClose: (result: boolean) => void;
}
const useTenantDeleteConfirmDialogStyles = makeStyles()((theme) => ({
  confirmBtn: {
    color: theme.palette.error.main,
  },
}));
const TenantDeleteConfirmDialog = (props: TenantDeleteConfirmDialogProps) => {
  const { id, multiDelete, onClose, tenantModel } = props;
  const { t } = useTranslation("actors");
  const [, popDialog] = useDialogContext();
  const { classes } = useTenantDeleteConfirmDialogStyles();
  const [confirmStr, setConfirmStr] = useState("");
  const { isLoading, data, error } = useModelGet(tenantModel, id);
  const [tenant] = data ?? [];
  const expectedConfirmStr = multiDelete
    ? t("tenants.confirm-delete.delete-multi")
    : (tenant?.short_name as string);

  const handleClose = useCallback(() => {
    onClose(false);
    popDialog();
  }, [onClose, popDialog]);

  const handleConfirm = useCallback(() => {
    onClose(true);
    popDialog();
  }, [onClose, popDialog]);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmStr(evt.target.value);
    },
    [],
  );

  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>{t("tenants.confirm-delete.title")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {isLoading && (
            <Grid size={12}>
              <Loader />
            </Grid>
          )}
          {error && (
            <Grid size={12}>
              <Typography color={"error"}>
                {(error as Error).message}
              </Typography>
            </Grid>
          )}
          {tenant && (
            <>
              <Grid size={12}>
                <Typography>
                  {t(
                    multiDelete
                      ? "tenants.confirm-delete.explainer-multi"
                      : "tenants.confirm-delete.explainer",
                    { CONFIRM_STR: expectedConfirmStr },
                  )}
                </Typography>
              </Grid>
              <Grid size={12}>
                <TextField
                  label={t("tenants.confirm-delete.text-box-label")}
                  placeholder={expectedConfirmStr}
                  value={confirmStr}
                  onChange={handleChange}
                  error={!!confirmStr && confirmStr !== expectedConfirmStr}
                  fullWidth
                  variant={"standard"}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {t("tenants.confirm-delete.close")}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={expectedConfirmStr !== confirmStr}
          className={classes.confirmBtn}
        >
          {t("tenants.confirm-delete.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const useShowTenantDeleteConfirmDialog = () => {
  const [pushDialog] = useDialogContext();
  const tenantModel = useTenantModel();
  return (inverted: boolean, ids: string[]) => {
    const multiDelete = inverted || ids.length > 1;
    if (!multiDelete && ids.length === 0) throw new Error("no selected ids");
    return new Promise<void>((resolve, reject) => {
      pushDialog(
        <TenantDeleteConfirmDialog
          id={multiDelete ? null : ids[0]}
          multiDelete={multiDelete}
          tenantModel={tenantModel}
          onClose={(result) => {
            if (result) {
              resolve();
            } else {
              reject();
            }
          }}
        />,
      );
    });
  };
};

export default React.memo(TenantDeleteConfirmDialog);
