import React from "react";
import ImCrud from "../../components-care/ImCrud";
import { useProfileModel } from "../../components-care/models/ProfileModel";
import ProfileForm from "./ProfileForm";

const formProps = {
  renderConditionally: true,
};

const ProfilePage = () => {
  const model = useProfileModel();

  return (
    <ImCrud
      model={model}
      disableRouting
      disableBackgroundGrid
      initialView={"singleton"}
      readPermission={null}
      newPermission={false}
      editPermission={null}
      deletePermission={null}
      exportPermission={false}
      formProps={formProps}
    >
      {ProfileForm}
    </ImCrud>
  );
};

export default React.memo(ProfilePage);
