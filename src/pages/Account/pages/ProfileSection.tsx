import React from "react";
import { DefaultErrorComponent, Form } from "components-care";
import { useTranslation } from "react-i18next";
import { useProfileModel } from "../../../components-care/models/ProfileModel";
import AccountPage from "../components/AccountPage";
import ProfileForm from "./ProfileForm";

const ProfileSection = () => {
  const { t } = useTranslation("account");
  const model = useProfileModel();
  return (
    <AccountPage title={t("profile.title")}>
      {/* only the fields shown are sent: the picture saves itself, the
          addresses and the password have their own dialogs. disableRouting:
          the other account pages lie below this page's URL, so without it
          leaving with unsaved changes would count as staying on the page */}
      <Form
        model={model}
        id={"singleton"}
        errorComponent={DefaultErrorComponent}
        customProps={undefined}
        renderConditionally
        onlySubmitMounted
        onlyValidateMounted
        disableRouting
      >
        {ProfileForm}
      </Form>
    </AccountPage>
  );
};

export default React.memo(ProfileSection);
