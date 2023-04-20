import React from "react";
import OrgUnitForm from "./OrgUnitForm";
import { useOrgUnitTree } from "../OrgUnits";

const OrgUnits = () => {
  return useOrgUnitTree(OrgUnitForm);
};

export default React.memo(OrgUnits);
