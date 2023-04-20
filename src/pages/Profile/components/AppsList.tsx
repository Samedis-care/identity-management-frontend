import React, { useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  FullFormDialog,
  Loader,
  ModelDataStore,
  showErrorDialog,
  showInputDialog,
  useDialogContext,
} from "components-care";
import { useQuery } from "react-query";
import BackendConnector from "../../../components-care/connectors/BackendConnector";
import { useTranslation } from "react-i18next";
import {
  Description as PolicyIcon,
  OpenInNew as VisitAppIcon,
  RemoveCircle as DeleteIcon,
} from "@mui/icons-material";
import DocumentViewer from "../../Standalone/DocumentViewer";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";

export interface AppsListProps {
  confirmEmail: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: "100%",
    overflow: "auto",
  },
  tableButtons: {
    textAlign: "right",
  },
  policyDeclined: {
    color: theme.palette.error.main,
  },
  policyAccepted: {
    color: theme.palette.success.main,
  },
  policyNotPresent: {
    color: theme.palette.action.disabled,
  },
}));

interface AppType {
  id: string;
  name: string;
  image: {
    small: string;
    medium: string;
    large: string;
  };
  url: string;
  required_documents: string[];
  requires_acceptance: string[];
}

const AppsList = (props: AppsListProps) => {
  const { confirmEmail } = props;
  const classes = useStyles();
  const [pushDialog, popDialog] = useDialogContext();
  const { t } = useTranslation("profile");
  const { data, isLoading, error } = useQuery(
    "my-user-apps",
    async () =>
      (await new BackendConnector("v1/user/apps").index({ rows: 100 }))[0]
  );

  const visitApp = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  const openPolicy = useCallback(
    (appName: string, policies: string[], notAcceptedPolicies: string[]) => {
      const openPolicy = (policyName: string) =>
        pushDialog(
          <FullFormDialog>
            <DocumentViewer
              app={appName}
              name={policyName}
              decline={popDialog}
              accept={popDialog}
              queryParams={{}}
              dialogMode
            />
          </FullFormDialog>
        );

      if (policies.length === 1) {
        openPolicy(policies[0]);
        return;
      }

      pushDialog(
        <Dialog onClose={popDialog} open={true}>
          <DialogTitle>
            {t("tabs.apps.dialogs.select-document.title")}
          </DialogTitle>
          <List>
            {policies.map((policy) => (
              <ListItem
                button
                onClick={() => {
                  popDialog();
                  openPolicy(policy);
                }}
                key={policy}
              >
                <ListItemIcon>
                  <PolicyIcon
                    className={
                      notAcceptedPolicies.includes(policy)
                        ? classes.policyDeclined
                        : classes.policyAccepted
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={t(
                    "tabs.apps.dialogs.select-document.option." + policy
                  )}
                />
              </ListItem>
            ))}
          </List>
        </Dialog>
      );
    },
    [classes.policyAccepted, classes.policyDeclined, popDialog, pushDialog, t]
  );

  const removeApp = useCallback(
    async (id: string) => {
      try {
        await showInputDialog(pushDialog, {
          title: t("tabs.apps.dialogs.remove-app-confirm.title"),
          message: (
            <Typography color={"error"}>
              {t("tabs.apps.dialogs.remove-app-confirm.message")}
            </Typography>
          ),
          textButtonYes: t("tabs.apps.dialogs.remove-app-confirm.yes"),
          textButtonNo: t("tabs.apps.dialogs.remove-app-confirm.no"),
          textFieldLabel: t(
            "tabs.apps.dialogs.remove-app-confirm.text-field-label"
          ),
          textFieldPlaceholder: t(
            "tabs.apps.dialogs.remove-app-confirm.text-field-placeholder"
          ),
          textFieldValidator: (value) => value === confirmEmail,
        });
      } catch (e) {
        // cancelled
        return;
      }
      try {
        await BackendHttpClient.delete(`/api/v1/user/quits/${id}`, null);
        await ModelDataStore.invalidateQueries("my-user-apps");
      } catch (err) {
        console.error("Fail removing app", err);
        showErrorDialog(pushDialog, {
          title: t("tabs.apps.dialogs.remove-app-error.title"),
          message: (err as Error).message,
        });
      }
    },
    [confirmEmail, pushDialog, t]
  );

  if (isLoading) return <Loader />;
  if (error) return <span>{(error as Error).message}</span>;

  return (
    <Paper className={classes.root}>
      <Table>
        <TableBody>
          {data &&
            (data as unknown[] as AppType[])
              .filter((app) => app.name !== "identity-management")
              .map((app) => {
                return (
                  <TableRow key={app.name}>
                    <TableCell>
                      <Tooltip title={app.name}>
                        <img src={app.image.small} alt={app.name} />
                      </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableButtons}>
                      <Tooltip title={t("tabs.apps.buttons.visit")!}>
                        <IconButton
                          onClick={() => visitApp(app.url)}
                          size="large"
                        >
                          <VisitAppIcon color={"primary"} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("tabs.apps.buttons.review-policy")!}>
                        <IconButton
                          onClick={() =>
                            openPolicy(
                              app.name,
                              app.required_documents,
                              app.requires_acceptance
                            )
                          }
                          disabled={app.required_documents.length === 0}
                          size="large"
                        >
                          <PolicyIcon
                            className={
                              app.required_documents.length > 0
                                ? app.requires_acceptance.length > 0
                                  ? classes.policyDeclined
                                  : classes.policyAccepted
                                : classes.policyNotPresent
                            }
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("tabs.apps.buttons.remove-app")!}>
                        <IconButton
                          onClick={() => removeApp(app.id)}
                          size="large"
                        >
                          <DeleteIcon color={"error"} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default React.memo(AppsList);
