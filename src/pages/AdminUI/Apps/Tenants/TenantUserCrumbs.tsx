import React from "react";
import { useModelGet } from "components-care";
import { CrudSpecialIds } from "components-care/dist/backend-components/CRUD";
import DrillDownBar, {
  DrillDownCrumb,
} from "../../../../components/DrillDownBar";
import {
  useUserModel,
  UserModelToRowLabel,
} from "../../../../components-care/models/UserModel";

export interface TenantUserCrumbsProps {
  /** the user opened from the users tab, or new */
  userId: string;
  /** crumbs leading to the users tab */
  prefix: DrillDownCrumb[];
}

/** path back from a user opened on the tenant page, ending in the user's name */
const TenantUserCrumbs = (props: TenantUserCrumbsProps) => {
  const { userId, prefix } = props;
  const model = useUserModel();
  const special = CrudSpecialIds.includes(userId);
  const { data } = useModelGet(model, special ? null : userId);
  const label = data ? UserModelToRowLabel(data[0]) : "…";
  return <DrillDownBar crumbs={[...prefix, { label }]} />;
};

export default React.memo(TenantUserCrumbs);
