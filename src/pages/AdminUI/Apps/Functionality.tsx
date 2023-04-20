import React from "react";
import ImCrud from "../../../components-care/ImCrud";
import { useFunctionalityModel } from "../../../components-care/models/FunctionalityModel";
import FunctionalityForm from "./FunctionalityForm";

const Functionality = () => {
  const model = useFunctionalityModel();

  return (
    <ImCrud
      model={model}
      readPermission={"functionalities.reader"}
      editPermission={"functionalities.writer"}
      newPermission={"functionalities.writer"}
      exportPermission={"functionalities.exporter"}
      deletePermission={"functionalities.deleter"}
    >
      {FunctionalityForm}
    </ImCrud>
  );
};

export default React.memo(Functionality);
