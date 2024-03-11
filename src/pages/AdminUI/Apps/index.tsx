import React, { useCallback } from "react";
import { useAppAdminModel } from "../../../components-care/models/AppAdminModel";
import {
  BackendDataGrid,
  DataGridLocalStoragePersist,
  hasPermission,
  usePermissionContext,
  useNavigate,
} from "components-care";
import { useDefaultGridProps } from "../../../components-care/ImCrud";
import GridWrapper from "../../../components-care/GridWrapper";

const AppsCrud = () => {
  const model = useAppAdminModel();
  const [perms] = usePermissionContext();
  const defaultGridProps = useDefaultGridProps();
  const navigate = useNavigate();

  const showEditPage = useCallback(
    (id: string) => navigate(`/apps/${id}`),
    [navigate],
  );
  const handleAddNew = useCallback(() => navigate(`/apps/new`), [navigate]);

  return (
    <GridWrapper>
      <DataGridLocalStoragePersist
        storageKey={"datagrid-persist-" + model.modelId}
      >
        <BackendDataGrid
          enableDelete={hasPermission(perms, "apps.deleter")}
          disableExport={!hasPermission(perms, "apps.exporter")}
          {...defaultGridProps}
          model={model}
          onEdit={
            hasPermission(perms, "apps.reader") ? showEditPage : undefined
          }
          onAddNew={
            hasPermission(perms, "apps.writer") ? handleAddNew : undefined
          }
        />
      </DataGridLocalStoragePersist>
    </GridWrapper>
  );
};

export default React.memo(AppsCrud);
