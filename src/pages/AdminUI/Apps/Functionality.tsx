import React from "react";
import ImCrud from "../../../components-care/ImCrud";
import {
  useFunctionalityModel,
  FunctionalityModelToSelectorData,
} from "../../../components-care/models/FunctionalityModel";
import FunctionalityForm from "./FunctionalityForm";

const Functionality = () => {
  const model = useFunctionalityModel();

  return (
    <ImCrud
      model={model}
      getRowLabel={FunctionalityModelToSelectorData}
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
