import React from "react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  DeleteOutlined,
  DescriptionOutlined,
  OpenInNew,
} from "@mui/icons-material";
import {
  ActionButton,
  FullFormDialog,
  GroupBox,
  Loader,
  ModelDataStore,
  useCloseThisDialog,
  useDialogContext,
  useModelGet,
} from "components-care";
import { useTranslation } from "react-i18next";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import DocumentViewer from "../../Standalone/DocumentViewer";
import AccountDialog, { Full } from "../components/AccountDialog";
import AccountPage from "../components/AccountPage";
import { BoxBody, Buttons, Status, ErrorInfo } from "../components/Section";
import ConfirmByEmailDialog from "../dialogs/ConfirmByEmailDialog";
import { MY_APPS_QUERY_KEY, MyApp, useMyApps } from "../useMyApps";

const AppLogo = (props: { app: MyApp }) => {
  const { app } = props;
  const src = app.image?.small;
  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 1,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: src ? "transparent" : "secondary.main",
        color: "secondary.contrastText",
        fontWeight: 700,
        fontSize: 22,
        "& img": { maxWidth: "100%", maxHeight: "100%" },
      }}
    >
      {src ? (
        <img src={src} alt={""} />
      ) : (
        (app.full_name || app.name).charAt(0).toUpperCase()
      )}
    </Box>
  );
};

/** lets the user pick one of several documents of an app */
const DocumentPickerDialog = (props: {
  app: MyApp;
  onPick: (name: string) => void;
}) => {
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  return (
    <AccountDialog
      title={t("dialogs.documents.title", {
        APP: props.app.full_name || props.app.name,
      })}
      onClose={close}
    >
      <Full>
        <List disablePadding>
          {props.app.required_documents.map((doc) => (
            <ListItemButton
              key={doc}
              onClick={() => {
                close();
                props.onPick(doc);
              }}
            >
              <ListItemIcon>
                <DescriptionOutlined
                  color={
                    props.app.requires_acceptance.includes(doc)
                      ? "warning"
                      : "success"
                  }
                />
              </ListItemIcon>
              <ListItemText
                primary={t("apps.documents." + doc, { defaultValue: doc })}
              />
            </ListItemButton>
          ))}
        </List>
      </Full>
    </AccountDialog>
  );
};

const AppsSection = () => {
  const { t } = useTranslation("account");
  const [pushDialog] = useDialogContext();
  const { data: apps, isLoading, error } = useMyApps();
  const profileModel = useProfileModel();
  const { data: profile } = useModelGet(profileModel, "singleton");
  const email = (profile?.[0]?.email as string | undefined) ?? "";

  const openDocument = (app: MyApp, name: string) => {
    const close = pushDialog(
      <FullFormDialog>
        <DocumentViewer
          app={app.name}
          name={name}
          decline={() => close()}
          accept={() => close()}
          queryParams={{}}
          dialogMode
        />
      </FullFormDialog>,
    );
  };

  const openTerms = (app: MyApp) => {
    if (app.required_documents.length === 1)
      openDocument(app, app.required_documents[0]);
    else
      pushDialog(
        <DocumentPickerDialog
          app={app}
          onPick={(doc) => openDocument(app, doc)}
        />,
      );
  };

  const removeApp = (app: MyApp) =>
    pushDialog(
      <ConfirmByEmailDialog
        title={t("dialogs.remove-app.title", {
          APP: app.full_name || app.name,
        })}
        heading={t("dialogs.remove-app.heading")}
        text={t("dialogs.remove-app.text")}
        confirmLabel={t("dialogs.remove-app.confirm")}
        submitLabel={t("dialogs.remove-app.submit")}
        submitIcon={<DeleteOutlined />}
        email={email}
        onConfirm={async () => {
          await BackendHttpClient.delete(`/api/v1/user/quits/${app.id}`, null);
          await ModelDataStore.invalidateQueries({
            queryKey: MY_APPS_QUERY_KEY,
          });
        }}
      />,
    );

  const visible = (apps ?? []).filter(
    (app) => app.name !== "identity-management",
  );

  return (
    <AccountPage title={t("apps.title")}>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorInfo message={(error as Error).message} />
      ) : (
        <GroupBox label={t("apps.box")}>
          <BoxBody>
            {visible.length === 0 && (
              <Typography color={"text.secondary"}>{t("apps.none")}</Typography>
            )}
            {visible.map((app, idx) => {
              const hasTerms = app.required_documents.length > 0;
              const accepted = app.requires_acceptance.length === 0;
              return (
                <React.Fragment key={app.id}>
                  {idx > 0 && <Divider />}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <AppLogo app={app} />
                    <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
                      <Typography variant={"subtitle1"}>
                        {app.full_name || app.name}
                      </Typography>
                      <Typography
                        color={"text.secondary"}
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {app.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </Typography>
                      {hasTerms ? (
                        <Status ok={accepted}>
                          {t(
                            accepted
                              ? "apps.terms-accepted"
                              : "apps.terms-pending",
                          )}
                        </Status>
                      ) : (
                        <Typography color={"text.secondary"}>
                          {t("apps.terms-none")}
                        </Typography>
                      )}
                    </Box>
                    <Buttons>
                      <ActionButton
                        fullWidth={false}
                        icon={<OpenInNew />}
                        onClick={() =>
                          window.open(app.url, "_blank", "noopener,noreferrer")
                        }
                      >
                        {t("apps.open")}
                      </ActionButton>
                      {hasTerms && (
                        <ActionButton
                          fullWidth={false}
                          icon={<DescriptionOutlined />}
                          onClick={() => openTerms(app)}
                        >
                          {t("apps.terms")}
                        </ActionButton>
                      )}
                      <ActionButton
                        fullWidth={false}
                        color={"error"}
                        icon={<DeleteOutlined />}
                        onClick={() => removeApp(app)}
                      >
                        {t("apps.remove")}
                      </ActionButton>
                    </Buttons>
                  </Box>
                </React.Fragment>
              );
            })}
            {visible.length > 0 && (
              <Typography color={"text.secondary"}>
                {t("apps.remove-hint")}
              </Typography>
            )}
          </BoxBody>
        </GroupBox>
      )}
    </AccountPage>
  );
};

export default React.memo(AppsSection);
