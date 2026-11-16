import React from "react";
import { GroupBox, Loader, useModelGet } from "components-care";
import { Divider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import { DEFAULT_ACCOUNT_APP } from "../../../utils/useAccountApp";
import AccountPage from "../components/AccountPage";
import AppRow from "../components/AppRow";
import ErrorInfo from "../components/ErrorInfo";
import SectionBody from "../components/SectionBody";
import { useMyApps } from "../useMyApps";

const AppsSection = () => {
  const { t } = useTranslation("account");
  const apps = useMyApps();
  const profileModel = useProfileModel();
  // the sign-in address confirms a removal, so the list waits for it
  const profile = useModelGet(profileModel, "singleton");
  const error = apps.error ?? profile.error;
  const email = profile.data?.[0].email;
  const visible = (apps.data ?? []).filter(
    (app) => app.name !== DEFAULT_ACCOUNT_APP,
  );

  return (
    <AccountPage title={t("apps.title")}>
      {error ? (
        <ErrorInfo message={error.message} />
      ) : !apps.data || !email ? (
        <Loader />
      ) : (
        <GroupBox label={t("apps.box")}>
          <SectionBody>
            {visible.length === 0 && (
              <Typography color={"text.secondary"}>{t("apps.none")}</Typography>
            )}
            {visible.map((app, idx) => (
              <React.Fragment key={app.id}>
                {idx > 0 && <Divider />}
                <AppRow app={app} email={email} />
              </React.Fragment>
            ))}
            {visible.length > 0 && (
              <Typography color={"text.secondary"}>
                {t("apps.remove-hint")}
              </Typography>
            )}
          </SectionBody>
        </GroupBox>
      )}
    </AccountPage>
  );
};

export default React.memo(AppsSection);
