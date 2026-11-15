import React, { useMemo } from "react";
import {
  hasPermission,
  Route,
  RoutedTabs,
  Routes,
  useLocation,
  useModelGet,
  usePermissionContext,
  useRouteInfo,
} from "components-care";
import { AppBar, Box, Tab, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import General from "./General";
import Users from "./Users";
import OrgUnits from "./OrgUnits";
import Forbidden from "../../../Forbidden";
import DrillDownBar, {
  DrillDownCrumb,
} from "../../../../components/DrillDownBar";
import { useTenantModel } from "../../../../components-care/models/TenantModel";
import {
  useUserModel,
  UserModelToRowLabel,
} from "../../../../components-care/models/UserModel";
import { CrudSpecialIds } from "components-care/dist/backend-components/CRUD";
import useApp from "../../../../utils/useApp";
import useTenant from "../../../../utils/useTenant";
import { useAdminTitle } from "../../AdminTitle";
import { TenantCrumbsContext } from "./TenantCrumbsContext";

const Root = styled(Box)({
  flexGrow: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  "& > :last-child": { flexGrow: 1, minHeight: 0 },
});

const UserCrumbs = (props: { userId: string; prefix: DrillDownCrumb[] }) => {
  const { userId, prefix } = props;
  const model = useUserModel();
  const special = CrudSpecialIds.includes(userId);
  const { data } = useModelGet(model, special ? null : userId);
  const label = data ? UserModelToRowLabel(data[0]) : "…";
  return <DrillDownBar crumbs={[...prefix, { label }]} />;
};

/**
 * One page per tenant: tabs tenant data, users and org units. A user or an
 * org unit opened from its tab replaces the tab bar by the path back
 * (DrillDownBar), because those records have tabs of their own.
 */
const TenantPage = () => {
  const { t } = useTranslation("account");
  const [perms] = usePermissionContext();
  const app = useApp();
  const tenant = useTenant();
  let { url } = useRouteInfo();
  if (url.endsWith("/")) url = url.substring(0, url.length - 1);
  const { pathname } = useLocation();
  const rest = pathname
    .substring(url.length)
    .split("/")
    .filter((part) => part);
  const section = rest[0] ?? "";
  const isNew = CrudSpecialIds.includes(tenant);

  const tenantModel = useTenantModel(app);
  const { data } = useModelGet(tenantModel, isNew ? null : tenant);
  const tenantName = data ? (data[0].short_name as string) : null;
  useAdminTitle(isNew ? null : tenantName);

  const canUsers = hasPermission(perms, "users.reader");
  const canOus = hasPermission(perms, "actors.reader");

  const usersCrumbs = useMemo(
    (): DrillDownCrumb[] => [
      { label: tenantName ?? "…", to: url },
      { label: t("admin.users"), to: url + "/users" },
    ],
    [tenantName, url, t],
  );
  const ousCrumbs = useMemo(
    (): DrillDownCrumb[] => [{ label: tenantName ?? "…", to: url }],
    [tenantName, url],
  );

  // records opened from a tab: users/:id, ous/:id/...
  const drillDown = rest.length > 1 && section !== "";
  return (
    <Root>
      {!isNew && !drillDown && (
        <AppBar position={"static"}>
          <RoutedTabs>
            <Tab value={""} label={t("admin.tenant")} />
            {canUsers && <Tab value={"users"} label={t("admin.users")} />}
            {canOus && <Tab value={"ous"} label={t("admin.org-units")} />}
          </RoutedTabs>
        </AppBar>
      )}
      {drillDown && section === "users" && (
        <UserCrumbs userId={rest[1]} prefix={usersCrumbs} />
      )}
      <TenantCrumbsContext.Provider value={ousCrumbs}>
        <Routes>
          <Route
            path={"users/*"}
            element={canUsers ? <Users /> : <Forbidden />}
          />
          <Route
            path={"ous/*"}
            element={canOus ? <OrgUnits /> : <Forbidden />}
          />
          <Route path={"*"} element={<General />} />
        </Routes>
      </TenantCrumbsContext.Provider>
    </Root>
  );
};

export default React.memo(TenantPage);
