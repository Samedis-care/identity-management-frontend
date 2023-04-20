import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import ImCrud from "../../../components-care/ImCrud";
import { useAppAdminModel } from "../../../components-care/models/AppAdminModel";
import GeneralForm from "./GeneralForm";
import { useParams } from "react-router-dom";

export interface GeneralProps {}

export interface AppEditFormContextType {
  setLocales: Dispatch<SetStateAction<string[]>>;
}
const AppEditFormContext = React.createContext<
  AppEditFormContextType | undefined
>(undefined);
export const useAppEditFormContext = () => {
  const ctx = useContext(AppEditFormContext);
  if (!ctx) throw new Error("Missing app edit form context");
  return ctx;
};

const General = (props: GeneralProps) => {
  const [locales, setLocales] = useState<string[]>([]);
  const model = useAppAdminModel({ appLocales: locales });
  const params = useParams<{ app: string }>();

  return (
    <AppEditFormContext.Provider
      value={{
        setLocales,
      }}
    >
      <ImCrud
        model={model}
        readPermission={"apps.reader"}
        editPermission={"apps.writer"}
        newPermission={"apps.writer"}
        exportPermission={"apps.exporter"}
        deletePermission={"apps.deleter"}
        disableBackgroundGrid
        disableRouting
        initialView={params.app}
        formProps={{
          renderConditionally: true,
        }}
      >
        {GeneralForm}
      </ImCrud>
    </AppEditFormContext.Provider>
  );
};

export default React.memo(General);
