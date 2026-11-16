import React, { useContext } from "react";
import OrgUnitForm from "./OrgUnitForm";
import { useOrgUnitTree } from "../OrgUnits";
import { TenantCrumbsContext } from "./TenantCrumbsContext";

const OrgUnits = () => {
  const crumbs = useContext(TenantCrumbsContext);
  return useOrgUnitTree({
    form: OrgUnitForm,
    storageKey: "tenant-ous",
    crumbsPrefix: crumbs,
  });
};

export default React.memo(OrgUnits);
