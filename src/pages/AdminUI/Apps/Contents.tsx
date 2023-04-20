import React from "react";
import ImCrud from "../../../components-care/ImCrud";
import ContentsForm from "./ContentsForm";
import { useContentModel } from "../../../components-care/models/ContentModel";

const Contents = () => {
  const model = useContentModel();

  return (
    <ImCrud
      model={model}
      readPermission={"contents.reader"}
      editPermission={"contents.writer"}
      newPermission={"contents.writer"}
      exportPermission={"contents.exporter"}
      deletePermission={"contents.deleter"}
    >
      {ContentsForm}
    </ImCrud>
  );
};

export default React.memo(Contents);
