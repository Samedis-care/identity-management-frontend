import React, { useCallback } from "react";
import { styled, Typography } from "@mui/material";
import {
  DeleteOutlined,
  DescriptionOutlined,
  OpenInNew,
} from "@mui/icons-material";
import {
  ActionButton,
  FullFormDialog,
  ModelDataStore,
  useDialogContext,
} from "components-care";
import { useTranslation } from "react-i18next";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import DocumentViewer from "../../Standalone/DocumentViewer";
import ConfirmByEmailDialog from "../dialogs/ConfirmByEmailDialog";
import DocumentPickerDialog from "../dialogs/DocumentPickerDialog";
import { MY_APPS_QUERY_KEY, MyApp } from "../useMyApps";
import AppLogo from "./AppLogo";
import SectionButtons from "./SectionButtons";
import StatusLine from "./StatusLine";

export interface AppRowProps {
  app: MyApp;
  /** the user's sign-in address, typed to confirm the removal */
  email: string;
}

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

const Details = styled("div")({
  flex: "1 1 220px",
  minWidth: 0,
});

const Url = styled(Typography)({
  overflowWrap: "anywhere",
});

/** an app the user has access to: open it, read its terms, remove the access */
const AppRow = (props: AppRowProps) => {
  const { app, email } = props;
  const { t } = useTranslation("account");
  const [pushDialog] = useDialogContext();
  const hasTerms = app.required_documents.length > 0;
  const accepted = app.requires_acceptance.length === 0;

  const openApp = useCallback(() => {
    window.open(app.url, "_blank", "noopener,noreferrer");
  }, [app.url]);
  const openDocument = useCallback(
    (name: string) => {
      const close = pushDialog(
        <FullFormDialog
          aria-label={t("apps.documents." + name, { defaultValue: name })}
        >
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
    },
    [app.name, pushDialog, t],
  );
  const openTerms = useCallback(() => {
    if (app.required_documents.length === 1)
      openDocument(app.required_documents[0]);
    else pushDialog(<DocumentPickerDialog app={app} onPick={openDocument} />);
  }, [app, openDocument, pushDialog]);
  const confirmRemove = useCallback(async () => {
    await BackendHttpClient.delete(`/api/v1/user/quits/${app.id}`, null);
    await ModelDataStore.invalidateQueries({ queryKey: MY_APPS_QUERY_KEY });
  }, [app.id]);
  const removeApp = useCallback(() => {
    pushDialog(
      <ConfirmByEmailDialog
        title={t("dialogs.remove-app.title", {
          APP: app.full_name || app.name,
        })}
        heading={t("dialogs.remove-app.heading")}
        text={t("dialogs.remove-app.text")}
        confirmLabel={t("dialogs.remove-app.confirm")}
        invalidText={t("dialogs.remove-app.invalid")}
        submitLabel={t("dialogs.remove-app.submit")}
        submitIcon={<DeleteOutlined />}
        email={email}
        onConfirm={confirmRemove}
      />,
    );
  }, [app.full_name, app.name, confirmRemove, email, pushDialog, t]);

  return (
    <Root>
      <AppLogo app={app} />
      <Details>
        <Typography variant={"subtitle1"}>
          {app.full_name || app.name}
        </Typography>
        <Url color={"text.secondary"}>
          {app.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </Url>
        {hasTerms ? (
          <StatusLine ok={accepted}>
            {t(accepted ? "apps.terms-accepted" : "apps.terms-pending")}
          </StatusLine>
        ) : (
          <Typography color={"text.secondary"}>
            {t("apps.terms-none")}
          </Typography>
        )}
      </Details>
      <SectionButtons>
        <ActionButton fullWidth={false} icon={<OpenInNew />} onClick={openApp}>
          {t("apps.open")}
        </ActionButton>
        {hasTerms && (
          <ActionButton
            fullWidth={false}
            icon={<DescriptionOutlined />}
            onClick={openTerms}
          >
            {t("apps.terms")}
          </ActionButton>
        )}
        <ActionButton
          fullWidth={false}
          color={"error"}
          icon={<DeleteOutlined />}
          onClick={removeApp}
        >
          {t("apps.remove")}
        </ActionButton>
      </SectionButtons>
    </Root>
  );
};

export default React.memo(AppRow);
