import React, { useCallback, useEffect } from "react";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { Button, Grid } from "@mui/material";
import {
  EditOnlyFormPage,
  FormField,
  useDialogContext,
  useFormContextLite,
  useFrontendDownload,
} from "components-care";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import { AppAdminModel } from "../../../components-care/models/AppAdminModel";
import { useTranslation } from "react-i18next";
import SeedsUploadDialog from "./components/SeedsUploadDialog";
import FormPagePaper from "../../../components/FormPagePaper";
import { useAppEditFormContext } from "./General";
import { AppInfo } from "../../../api/ident-services/AppInfo";

const GeneralForm = (
  props: PageProps<
    keyof ReturnType<typeof AppAdminModel>["fields"],
    CrudFormProps
  >,
) => {
  const { t } = useTranslation("app-admin");
  const [pushDialog] = useDialogContext();
  const downloadFile = useFrontendDownload();
  const { model } = useFormContextLite();
  const { setLocales } = useAppEditFormContext();
  const config = props.values!.config as AppInfo["config"];

  // pass locales back to model for default locale selection
  useEffect(() => {
    setLocales(config.locales);
  }, [config.locales, setLocales]);

  const handleExport = useCallback(async () => {
    const [app] = await model.getCached(props.id);
    downloadFile(
      new File([app.import_roles as string], app.name + "_roles.yml"),
    );
    const localeRoles = app.locale_import_roles as Record<string, string>;
    Object.entries(localeRoles).forEach(([lang, value]) =>
      downloadFile(new File([value], `${app.name}_locale_roles_${lang}.yml`)),
    );
    downloadFile(
      new File([app.import_candos as string], app.name + "_permissions.yml"),
    );
    const localePermissions = app.locale_import_candos as Record<
      string,
      string
    >;
    Object.entries(localePermissions).forEach(([lang, value]) =>
      downloadFile(
        new File([value], `${app.name}_locale_permissions_${lang}.yml`),
      ),
    );
  }, [props.id, model, downloadFile]);

  const handleImport = useCallback(async () => {
    if (!props.id) throw new Error("handleImport called without ID");
    pushDialog(<SeedsUploadDialog id={props.id} />);
  }, [pushDialog, props.id]);

  return (
    <EditOnlyFormPage {...props} customProps={undefined}>
      <FormPagePaper>
        <Grid container spacing={2}>
          {[
            "name",
            "short_name",
            "full_name",
            "config.url",
            "config.uses_bearer_token",
            "config.locales",
            "config.default_locale",
            "config.mailer.from",
            "config.mailer.reply_to",
            "config.mailer.support_email",
            "config.mailer.logo_b64",
            "config.mailer.footer_html_translations",
            "config.mailer.smtp_settings.address",
            "config.mailer.smtp_settings.port",
            "config.mailer.smtp_settings.domain",
            "config.mailer.smtp_settings.user_name",
            "config.mailer.smtp_settings.password",
            "config.mailer.smtp_settings.authentication",
            "config.mailer.smtp_settings.enable_starttls",
            "config.mailer.smtp_settings.enable_starttls_auto",
            "config.mailer.smtp_settings.openssl_verify_mode",
            "config.mailer.smtp_settings.ssl",
            "config.mailer.smtp_settings.open_timeout",
            "config.mailer.smtp_settings.read_timeout",
            "config.theme.primary.main",
            "config.theme.primary.light",
            "config.theme.primary.dark",
            "config.theme.secondary.main",
            "config.theme.secondary.light",
            "config.theme.secondary.dark",
            "config.theme.background.default",
            "config.theme.background.advanced",
            "config.theme.components_care.ui_kit.action_button.background_color",
            "config.theme.mode",
          ].map((field) => (
            <Grid item xs={12} key={field}>
              <FormField name={field} />
            </Grid>
          ))}
          {props.id && (
            <>
              <Grid item xs={12} md={6}>
                <Button onClick={handleExport} fullWidth variant={"contained"}>
                  {t("form.export-roles-permissions")}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button onClick={handleImport} fullWidth variant={"contained"}>
                  {t("form.import-roles-permissions")}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </FormPagePaper>
    </EditOnlyFormPage>
  );
};

export default React.memo(GeneralForm);
