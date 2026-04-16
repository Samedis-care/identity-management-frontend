import React from "react";
import { useAppIdFromPath, useTenantIdFromPath } from "../../MenuDef";
import { useModelGet } from "components-care";
import { styled } from "@mui/material";
import { useTenantModel } from "../../../../components-care/models/TenantModel";

const Root = styled("div")({
  whiteSpace: "nowrap",
});

const TenantIndicator = () => {
  const app = useAppIdFromPath();
  const tenant = useTenantIdFromPath();
  const tenantModel = useTenantModel(app ?? "null");
  const { isLoading, data, error } = useModelGet(tenantModel, tenant);
  if (isLoading || error || data == null) return <></>;
  return <Root>{data[0].short_name as string}</Root>;
};

export default React.memo(TenantIndicator);
