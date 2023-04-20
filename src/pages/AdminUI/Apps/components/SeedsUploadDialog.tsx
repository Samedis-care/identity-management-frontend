import React from "react";
import { FullFormDialog } from "components-care";
import ImCrud from "../../../../components-care/ImCrud";
import { useTranslation } from "react-i18next";
import { useAppAdminModel } from "../../../../components-care/models/AppAdminModel";
import SeedsUploadForm from "./SeedsUploadForm";

export interface SeedsUploadDialogProps {
  /**
   * App ID
   */
  id: string;
}

const formOptions = { onlyValidateMounted: true };

const SeedsUploadDialog = (props: SeedsUploadDialogProps) => {
  const { t } = useTranslation("app-admin");
  const model = useAppAdminModel({ enableSeeding: true });

  return (
    <FullFormDialog dialogTitle={t("form.import-roles-permissions")}>
      <ImCrud
        model={model}
        initialView={props.id}
        disableRouting
        disableBackgroundGrid
        readPermission={"apps.reader"}
        editPermission={"apps.writer"}
        newPermission={"apps.writer"}
        exportPermission={"apps.exporter"}
        deletePermission={"apps.deleter"}
        formProps={formOptions}
      >
        {SeedsUploadForm}
      </ImCrud>
    </FullFormDialog>
  );
};

export default React.memo(SeedsUploadDialog);
