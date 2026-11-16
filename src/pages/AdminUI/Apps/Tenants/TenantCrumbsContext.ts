import React from "react";
import type { DrillDownCrumb } from "../../../../components/DrillDownBar";

/** crumbs leading to a tab of the tenant page, for records opened from it */
export const TenantCrumbsContext = React.createContext<DrillDownCrumb[]>([]);
