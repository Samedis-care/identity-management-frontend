import React from "react";
import ImCrud from "../../../components-care/ImCrud";
import {
  useUserModel,
  UserModelToRowLabel,
} from "../../../components-care/models/UserModel";
import UserForm from "./UserForm";

const UserCrud = () => {
  const model = useUserModel();

  return (
    <ImCrud
      model={model}
      getRowLabel={UserModelToRowLabel}
      readPermission={"users.reader"}
      editPermission={"users.writer"}
      newPermission={"users.writer"}
      exportPermission={"users.exporter"}
      deletePermission={"users.deleter"}
    >
      {UserForm}
    </ImCrud>
  );
};

export default React.memo(UserCrud);
