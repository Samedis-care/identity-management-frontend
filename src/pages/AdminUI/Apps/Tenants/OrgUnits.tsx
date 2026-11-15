import React, { useContext } from "react";
import OrgUnitForm from "./OrgUnitForm";
import { useOrgUnitTree } from "../OrgUnits";
import { TenantCrumbsContext } from "./TenantCrumbsContext";

const OrgUnits = () => {
  const crumbs = useContext(TenantCrumbsContext);
  return useOrgUnitTree(OrgUnitForm, "tenant-ous", crumbs);
};

export default React.memo(OrgUnits);
