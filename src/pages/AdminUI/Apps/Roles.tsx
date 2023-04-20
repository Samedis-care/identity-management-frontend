import React from "react";
import ImCrud from "../../../components-care/ImCrud";
import { useRoleModel } from "../../../components-care/models/RoleModel";
import RoleForm from "./RoleForm";

const Roles = () => {
  const model = useRoleModel();

  return (
    <ImCrud
      model={model}
      readPermission={"roles.reader"}
      editPermission={"roles.writer"}
      newPermission={"roles.writer"}
      exportPermission={"roles.exporter"}
      deletePermission={"roles.deleter"}
    >
      {RoleForm}
    </ImCrud>
  );
};

export default React.memo(Roles);
