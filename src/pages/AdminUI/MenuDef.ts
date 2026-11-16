import { IRoutedMenuItemDefinition } from "components-care/dist/non-standalone/Portal/Menu";
import React from "react";
import {
  AccountCircle as ProfileIcon,
  AccountTree as OUIcon,
  Apps as AppsIcon,
  ArrowBack as BackIcon,
  Description as ContentsIcon,
  DeviceHub as RolesIcon,
  Domain as TenantIcon,
  Email as EmailIcon,
  Functions as FunctionsIcon,
  Home as HomeIcon,
  Person as UsersIcon,
} from "@mui/icons-material";
import { CrudSpecialIds } from "components-care/dist/backend-components/CRUD";
import {
  hasPermission,
  usePermissionContext,
  useLocation,
} from "components-care";
import { useTranslation } from "react-i18next";

/** title is a key of the account namespace (admin.*) */
export interface MyMenuItemDefinition extends Omit<
  IRoutedMenuItemDefinition,
  "shouldRender"
> {
  cando: string | null;
  isBack?: boolean;
  component?: React.ComponentType;
}

const MenuDefL0: MyMenuItemDefinition[] = [
  {
    icon: ProfileIcon,
    title: "admin.profile",
    cando: null,
    route: "/profile",
    component: React.lazy(() => import("./ProfileRedirect")),
  },
  {
    icon: AppsIcon,
    title: "admin.apps",
    cando: "apps.reader",
    route: "/apps",
    component: React.lazy(() => import("./Apps")),
  },
  {
    icon: EmailIcon,
    title: "admin.email-blacklist",
    cando: "email-blacklists.reader",
    route: "/email-blacklist",
    component: React.lazy(() => import("./EmailBlacklist")),
  },
  {
    icon: UsersIcon,
    title: "admin.users",
    cando: "users.reader",
    route: "/users",
    component: React.lazy(() => import("./Users")),
  },
];

const MenuDefL1Apps: MyMenuItemDefinition[] = [
  {
    icon: BackIcon,
    title: "admin.back",
    cando: null,
    isBack: true,
    route: "/apps",
  },
  {
    icon: HomeIcon,
    title: "admin.general",
    cando: "apps.writer",
    route: "/apps/:app",
    component: React.lazy(() => import("./Apps/General")),
  },
  {
    icon: FunctionsIcon,
    title: "admin.functions",
    cando: "functionalities.reader",
    route: "/apps/:app/functions",
    component: React.lazy(() => import("./Apps/Functionality")),
  },
  {
    icon: RolesIcon,
    title: "admin.roles",
    cando: "roles.reader",
    route: "/apps/:app/roles",
    component: React.lazy(() => import("./Apps/Roles")),
  },
  {
    icon: UsersIcon,
    title: "admin.users",
    cando: "users.reader",
    route: "/apps/:app/users",
    component: React.lazy(() => import("./Apps/Users")),
  },
  {
    icon: OUIcon,
    title: "admin.org-units",
    cando: "actors.reader",
    route: "/apps/:app/ous",
    component: React.lazy(() => import("./Apps/OrgUnits")),
  },
  {
    icon: TenantIcon,
    title: "admin.tenants",
    cando: "tenants.reader",
    route: "/apps/:app/tenants",
    component: React.lazy(() => import("./Apps/Tenants")),
  },
  {
    icon: ContentsIcon,
    title: "admin.contents",
    cando: "contents.reader",
    route: "/apps/:app/contents",
    component: React.lazy(() => import("./Apps/Contents")),
  },
];

// a tenant is one page (tabs tenant, users, org units), shown below the
// "Mandanten" entry of the app menu; no menu level of its own
const TenantPageRoute: MyMenuItemDefinition = {
  icon: TenantIcon,
  title: "admin.tenant",
  cando: "tenants.reader",
  route: "/apps/:app/tenants/:tenant",
  component: React.lazy(() => import("./Apps/Tenants/TenantPage")),
};

export const AllMenuItems: MyMenuItemDefinition[] = [
  TenantPageRoute,
  ...MenuDefL1Apps,
  ...MenuDefL0,
];

export const checkMenuItemPermission = (
  perms: string[],
  def: MyMenuItemDefinition,
): boolean => !def.cando || hasPermission(perms, def.cando);

export const useMenuDefinition = (): IRoutedMenuItemDefinition[] => {
  const location = useLocation();
  const [perms] = usePermissionContext();
  const { t } = useTranslation("account");

  const convMenuDef = (
    def: MyMenuItemDefinition,
  ): IRoutedMenuItemDefinition => ({
    ...def,
    title: t(def.title),
    shouldRender: checkMenuItemPermission(perms, def),
  });

  const newOrImport = (prefix: string) =>
    CrudSpecialIds.find((id) => location.pathname.endsWith(prefix + id));
  let defs: MyMenuItemDefinition[];
  if (location.pathname.match(/\/apps\/.+?/) && !newOrImport("/apps/")) {
    defs = MenuDefL1Apps;
  } else {
    defs = MenuDefL0;
  }
  return defs.map(convMenuDef);
};

export const useAppIdFromPath = () => {
  const { pathname } = useLocation();
  const result = /\/apps\/([0-9a-fA-F]+)/.exec(pathname);
  if (result == null) return null;
  return result[1];
};

export const useTenantIdFromPath = () => {
  const { pathname } = useLocation();
  const result = /\/apps\/[0-9a-fA-F]+\/tenants\/([0-9a-fA-F]+)/.exec(pathname);
  if (result == null) return null;
  return result[1];
};
