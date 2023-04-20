import React from "react";
import { useAppIdFromPath } from "../../MenuDef";
import { useAppAdminModel } from "../../../../components-care/models/AppAdminModel";
import { useModelGet } from "components-care";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles({
  root: {
    whiteSpace: "nowrap",
  },
});

const AppIndicator = () => {
  const app = useAppIdFromPath();
  const appModel = useAppAdminModel();
  const classes = useStyles();
  const { isLoading, data, error } = useModelGet(appModel, app);
  if (isLoading || error || data == null) return <></>;
  return <div className={classes.root}>{data[0].short_name as string}</div>;
};

export default React.memo(AppIndicator);
