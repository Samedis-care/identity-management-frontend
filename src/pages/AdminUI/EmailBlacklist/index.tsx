import React from "react";
import ImCrud from "../../../components-care/ImCrud";
import UserForm from "./EmailBlacklistForm";
import { useEmailBlacklistModel } from "../../../components-care/models/EmailBlacklistModel";

const EmailBlacklistCrud = () => {
  const model = useEmailBlacklistModel();

  return (
    <ImCrud
      model={model}
      readPermission={"email-blacklists.reader"}
      editPermission={"email-blacklists.writer"}
      newPermission={"email-blacklists.writer"}
      exportPermission={"email-blacklists.exporter"}
      deletePermission={"email-blacklists.deleter"}
    >
      {UserForm}
    </ImCrud>
  );
};

export default React.memo(EmailBlacklistCrud);
