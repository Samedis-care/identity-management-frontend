import React from "react";
import ImCrud from "../../../../components-care/ImCrud";
import GeneralForm from "./GeneralForm";
import { useTenantModel } from "../../../../components-care/models/TenantModel";
import useTenant from "../../../../utils/useTenant";

const General = () => {
  const model = useTenantModel();
  const tenant = useTenant();

  // data grid is displayed in Tenants/index.tsx
  return (
    <ImCrud
      model={model}
      readPermission={"actors.reader"}
      editPermission={"actors.writer"}
      newPermission={"actors.writer"}
      exportPermission={"actors.exporter"}
      deletePermission={"actors.deleter"}
      disableBackgroundGrid
      disableRouting
      initialView={tenant}
    >
      {GeneralForm}
    </ImCrud>
  );
};

export default React.memo(General);
