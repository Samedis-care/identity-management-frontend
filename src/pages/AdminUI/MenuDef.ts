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
import { hasPermission, usePermissionContext } from "components-care";
import { useLocation } from "react-router";

export interface MyMenuItemDefinition
  extends Omit<IRoutedMenuItemDefinition, "shouldRender"> {
  cando: string | null;
  isBack?: boolean;
  component?: React.ComponentType;
}

const MenuDefL0: MyMenuItemDefinition[] = [
  {
    icon: ProfileIcon,
    title: "Profile",
    cando: null,
    route: "/profile",
    component: React.lazy(() => import("../Profile/ProfilePage")),
  },
  {
    icon: AppsIcon,
    title: "Apps",
    cando: "apps.reader",
    route: "/apps",
    component: React.lazy(() => import("./Apps")),
  },
  {
    icon: EmailIcon,
    title: "E-Mail Blacklist",
    cando: "email-blacklists.reader",
    route: "/email-blacklist",
    component: React.lazy(() => import("./EmailBlacklist")),
  },
  {
    icon: UsersIcon,
    title: "Benutzer",
    cando: "users.reader",
    route: "/users",
    component: React.lazy(() => import("./Users")),
  },
];

const MenuDefL1Apps: MyMenuItemDefinition[] = [
  {
    icon: BackIcon,
    title: "Back",
    cando: null,
    isBack: true,
    route: "/apps",
  },
  {
    icon: HomeIcon,
    title: "General",
    cando: "apps.writer",
    route: "/apps/:app",
    component: React.lazy(() => import("./Apps/General")),
  },
  {
    icon: FunctionsIcon,
    title: "Functions",
    cando: "functionalities.reader",
    route: "/apps/:app/functions",
    component: React.lazy(() => import("./Apps/Functionality")),
  },
  {
    icon: RolesIcon,
    title: "Roles",
    cando: "roles.reader",
    route: "/apps/:app/roles",
    component: React.lazy(() => import("./Apps/Roles")),
  },
  {
    icon: UsersIcon,
    title: "Users",
    cando: "users.reader",
    route: "/apps/:app/users",
    component: React.lazy(() => import("./Apps/Users")),
  },
  {
    icon: OUIcon,
    title: "Organizational Units",
    cando: "actors.reader",
    route: "/apps/:app/ous",
    component: React.lazy(() => import("./Apps/OrgUnits")),
  },
  {
    icon: TenantIcon,
    title: "Tenants",
    cando: "tenants.reader",
    route: "/apps/:app/tenants",
    component: React.lazy(() => import("./Apps/Tenants")),
  },
  {
    icon: ContentsIcon,
    title: "Contents",
    cando: "contents.reader",
    route: "/apps/:app/contents",
    component: React.lazy(() => import("./Apps/Contents")),
  },
];

const MenuDefL2Tenants: MyMenuItemDefinition[] = [
  {
    icon: BackIcon,
    title: "Back",
    cando: null,
    isBack: true,
    route: "/apps/:app/tenants",
  },
  {
    icon: HomeIcon,
    title: "General",
    cando: "tenants.writer",
    route: "/apps/:app/tenants/:tenant",
    component: React.lazy(() => import("./Apps/Tenants/General")),
  },
  {
    icon: OUIcon,
    title: "Organizational Units",
    cando: "actors.reader",
    route: "/apps/:app/tenants/:tenant/ous",
    component: React.lazy(() => import("./Apps/Tenants/OrgUnits")),
  },
  {
    icon: UsersIcon,
    title: "Users",
    cando: "users.reader",
    route: "/apps/:app/tenants/:tenant/users",
    component: React.lazy(() => import("./Apps/Tenants/Users")),
  },
];

export const AllMenuItems: MyMenuItemDefinition[] = [
  ...MenuDefL2Tenants,
  ...MenuDefL1Apps,
  ...MenuDefL0,
];

export const checkMenuItemPermission = (
  perms: string[],
  def: MyMenuItemDefinition
): boolean => !def.cando || hasPermission(perms, def.cando);

export const useMenuDefinition = (): IRoutedMenuItemDefinition[] => {
  const location = useLocation();
  const [perms] = usePermissionContext();

  const convMenuDef = (
    def: MyMenuItemDefinition
  ): IRoutedMenuItemDefinition => ({
    ...def,
    shouldRender: checkMenuItemPermission(perms, def),
  });

  const newOrImport = (prefix: string) =>
    CrudSpecialIds.find((id) => location.pathname.endsWith(prefix + id));
  let defs: MyMenuItemDefinition[];
  if (
    location.pathname.match(/\/apps\/.+?\/tenants\/.+?/) &&
    !newOrImport("/tenants/")
  ) {
    defs = MenuDefL2Tenants;
  } else if (location.pathname.match(/\/apps\/.+?/) && !newOrImport("/apps/")) {
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
