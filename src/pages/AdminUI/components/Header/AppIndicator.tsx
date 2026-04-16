import React from "react";
import { useAppIdFromPath } from "../../MenuDef";
import { useAppAdminModel } from "../../../../components-care/models/AppAdminModel";
import { useModelGet } from "components-care";
import { styled } from "@mui/material";

const Root = styled("div")({
  whiteSpace: "nowrap",
});

const AppIndicator = () => {
  const app = useAppIdFromPath();
  const appModel = useAppAdminModel();
  const { isLoading, data, error } = useModelGet(appModel, app);
  if (isLoading || error || data == null) return <></>;
  return <Root>{data[0].short_name as string}</Root>;
};

export default React.memo(AppIndicator);
