import React from "react";

const AccountSelection = React.lazy(() => import("./Auth/AccountSelection"));
const AuthAddAccount = React.lazy(() => import("./Auth/AddAccount"));
const AuthAuthAccount = React.lazy(() => import("./Auth/AuthAccount"));
const AuthCreateAccount = React.lazy(() => import("./Auth/CreateAccount"));
const AuthForgotPassword = React.lazy(() => import("./Auth/ForgotPassword"));
const AuthResetPassword = React.lazy(() => import("./Auth/ResetPassword"));
const AuthConfirmAccount = React.lazy(() => import("./Auth/ConfirmAccount"));

const DocumentViewerPage = React.lazy(
  () => import("./Standalone/DocumentViewerPage")
);

const ProfilePageStandalone = React.lazy(
  () => import("./Profile/ProfilePageStandalone")
);

export interface BasicRouteDefinition {
  path: string;
  component: React.ComponentType;
}

export const AuthRoutes: BasicRouteDefinition[] = [
  {
    path: "add-account",
    component: AuthAddAccount,
  },
  {
    path: "authenticate",
    component: AuthAuthAccount,
  },
  {
    path: "create-account",
    component: AuthCreateAccount,
  },
  {
    path: "confirm-account",
    component: AuthConfirmAccount,
  },
  {
    path: "forgot-password",
    component: AuthForgotPassword,
  },
  {
    path: "reset-password",
    component: AuthResetPassword,
  },
  {
    path: "*",
    component: AccountSelection,
  },
];

export const AnonRoutes: BasicRouteDefinition[] = [
  {
    path: "/acceptance/:app/:name",
    component: DocumentViewerPage,
  },
];

export const ExternalAuthenticatedRoutes: BasicRouteDefinition[] = [
  {
    path: "/my-profile",
    component: ProfilePageStandalone,
  },
];
