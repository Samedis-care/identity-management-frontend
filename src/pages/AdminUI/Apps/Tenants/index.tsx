import React, { useCallback } from "react";
import {
  BackendDataGrid,
  DataGridLocalStoragePersist,
  hasPermission,
  usePermissionContext,
  useNavigate,
} from "components-care";
import { useDefaultGridProps } from "../../../../components-care/ImCrud";
import GridWrapper from "../../../../components-care/GridWrapper";
import useApp from "../../../../utils/useApp";
import { useTenantModel } from "../../../../components-care/models/TenantModel";
import { useShowTenantDeleteConfirmDialog } from "./components/TenantDeleteConfirmDialog";

const TenantsCrud = () => {
  const model = useTenantModel();
  const [perms] = usePermissionContext();
  const defaultGridProps = useDefaultGridProps();
  const navigate = useNavigate();
  const app = useApp();
  const showDeleteConfirmDialog = useShowTenantDeleteConfirmDialog();

  const showEditPage = useCallback(
    (id: string) => navigate(`/apps/${app}/tenants/${id}`),
    [navigate, app],
  );
  const handleAddNew = useCallback(
    () => navigate(`/apps/${app}/tenants/new`),
    [navigate, app],
  );

  return (
    <GridWrapper>
      <DataGridLocalStoragePersist
        storageKey={"datagrid-persist-" + model.modelId}
      >
        <BackendDataGrid
          enableDelete={hasPermission(perms, "tenants.deleter")}
          disableExport={!hasPermission(perms, "tenants.exporter")}
          {...defaultGridProps}
          model={model}
          onEdit={
            hasPermission(perms, "tenants.reader") ? showEditPage : undefined
          }
          onAddNew={
            hasPermission(perms, "tenants.writer") ? handleAddNew : undefined
          }
          customDeleteConfirm={showDeleteConfirmDialog}
        />
      </DataGridLocalStoragePersist>
    </GridWrapper>
  );
};

export default React.memo(TenantsCrud);
