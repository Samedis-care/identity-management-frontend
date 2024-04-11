import React from "react";
import { useAppIdFromPath, useTenantIdFromPath } from "../../MenuDef";
import { useModelGet } from "components-care";
import { makeStyles } from "tss-react/mui";
import { useTenantModel } from "../../../../components-care/models/TenantModel";

const useStyles = makeStyles()({
  root: {
    whiteSpace: "nowrap",
  },
});

const TenantIndicator = () => {
  const app = useAppIdFromPath();
  const tenant = useTenantIdFromPath();
  const tenantModel = useTenantModel(app ?? "null");
  const { classes } = useStyles();
  const { isLoading, data, error } = useModelGet(tenantModel, tenant);
  if (isLoading || error || data == null) return <></>;
  return <div className={classes.root}>{data[0].short_name as string}</div>;
};

export default React.memo(TenantIndicator);
