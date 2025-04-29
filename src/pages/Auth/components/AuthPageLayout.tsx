import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Box,
  Container,
  createTheme,
  Grid,
  Link,
  Paper,
  ThemeOptions,
  ThemeProvider,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  CenteredTypography,
  deepAssign,
  Loader,
  showErrorDialog,
  useDialogContext,
  useLocation,
  useNavigate,
  useParams,
} from "components-care";
import { Account } from "../../../utils/AccountManager";
import { useQuery } from "@tanstack/react-query";
import BackendHttpClient from "../../../components-care/connectors/BackendHttpClient";
import { AppInfo, AppInfoResponse } from "../../../api/ident-services/AppInfo";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { ContentDataResponse } from "../../../api/ident-services/Content";
import { Trans, useTranslation } from "react-i18next";
import { marked } from "marked";
import SocialLogins, { enableSocialLogins } from "./SocialLogins";
import PolicyViewer from "../../../components/PolicyViewer";
import LangSelector from "./LangSelector";
import {
  ProviderImprintUrl,
  ProviderLegalName,
  ProviderLogoUrl,
} from "../../../constants";

export interface AuthPageLayoutProps {
  children: NonNullable<React.ReactNode>;
}

export interface AuthPageRouteParams {
  app?: string;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    position: "absolute",
    backgroundColor: theme.palette.background.advanced
      ? undefined
      : theme.palette.background.default,
    background: theme.palette.background.advanced || undefined,
    width: "100%",
    minHeight: "100%",
  },
  gridContainer: {
    minHeight: "100vh",
  },
  container: {
    height: "100%",
  },
  appInfo: {
    width: "100%",
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    width: "100%",
  },
  companyLogo: {
    maxWidth: "100%",
    width: "auto",
    height: "1.5rem",
    objectFit: "contain",
  },
  appIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    paddingBottom: theme.spacing(2),
  },
  langSelector: {
    left: "50%",
    transform: "translateX(-50%)",
  },
}));

export enum AuthFactorType {
  /**
   * Classic password
   */
  PASSWORD = "password",
  /**
   * Time-based one time password
   */
  TOPT = "topt",
  /**
   * Universal 2nd Factor => WebAuthn
   */
  U2F = "u2f",
  /**
   * managed account, used to show redirect screen
   */
  EXTERNAL_OAUTH = "ext_oauth",
}

export interface AuthPageState {
  /**
   * Show social logins?
   */
  showSocialLogins?: boolean;
  /**
   * Active (selected) account ID of user (may not be known)
   */
  activeAccount?: Account;
  /**
   * Current authentication factor for MFA.
   */
  currentFactor?: AuthFactorType;
  /**
   * Remaining authentication factors for MFA
   */
  remainingFactors: AuthFactorType[];
  /**
   * Redirect URL when auth is complete
   */
  redirectURL?: string;
}

export type AuthPageProps = Record<string, unknown>; // {}

export type AuthPageStateContextType = [
  AuthPageState,
  Dispatch<SetStateAction<AuthPageState>>,
];
const AuthPageStateContext =
  React.createContext<AuthPageStateContextType | null>(null);
export const useAuthPageState = (): AuthPageStateContextType => {
  const ctx = useContext(AuthPageStateContext);
  if (!ctx) throw new Error("Context not set");
  return ctx;
};

const AuthPageAppInfoContext = React.createContext<AppInfo | null>(null);
export const useAuthPageAppInfo = (): AppInfo => {
  const ctx = useContext(AuthPageAppInfoContext);
  if (!ctx) throw new Error("Context not set");
  return ctx;
};

export interface ProviderConfig {
  legalName: string;
  logo?: string | null;
  imprintUrl: string;
}

const CurrentProviderConfig: ProviderConfig = {
  legalName:
    ProviderLegalName ?? "REACT_APP_PROVIDER_LEGAL_NAME not configured!",
  logo: ProviderLogoUrl || null,
  imprintUrl:
    ProviderImprintUrl ??
    "javascript:alert('REACT_APP_PROVIDER_IMPRINT_URL not configured!')",
};

const AuthPageLayoutInner = (props: AuthPageLayoutProps) => {
  const { classes } = useStyles();
  const appInfo = useAuthPageAppInfo();
  const { app } = useParams();
  const { t, i18n } = useTranslation("auth");
  const [pushDialog] = useDialogContext();
  const navigate = useNavigate();
  const location = useLocation();

  // handle OAuth failure message
  useEffect(() => {
    const failureMessageId = "failure_message";
    const locationQuery = new URLSearchParams(location.search);
    const failureMessage = locationQuery.get(failureMessageId);
    if (!failureMessage) return;
    locationQuery.delete(failureMessageId);
    navigate({ ...location, search: locationQuery.toString() });
    void showErrorDialog(pushDialog, failureMessage);
  }, [location, navigate, pushDialog]);

  const { data: appText } = useQuery({
    queryKey: ["app-info", appInfo.id],
    queryFn: async () => {
      const contentRecord = appInfo.contents.find(
        (entry) => entry.name === "app-info",
      );
      if (!contentRecord) return "";

      const resp = await BackendHttpClient.get<ContentDataResponse>(
        contentRecord.url,
        null,
        AuthMode.Off,
      );

      const contents = resp.data.attributes.content_translations;

      return (
        // fallback lang
        contents[i18n.language.split("-")[0]] ?? contents["en"]
      );
    },
  });

  const showPrivacyDialog = useCallback(() => {
    pushDialog(<PolicyViewer document={"tos-privacy"} />);
  }, [pushDialog]);

  const statePack = useState<AuthPageState>({
    showSocialLogins: false,
    remainingFactors: [AuthFactorType.PASSWORD],
  });

  return (
    <div className={classes.root}>
      <Grid
        container
        direction={"column"}
        alignItems={"center"}
        justifyContent={"space-between"}
        alignContent={"stretch"}
        wrap={"nowrap"}
        className={classes.gridContainer}
      >
        <Grid size="grow">
          <Container maxWidth={"xs"} className={classes.container}>
            <Box my={4}>
              <Grid
                container
                direction={"column"}
                alignItems={"center"}
                justifyContent={"flex-start"}
                alignContent={"stretch"}
                className={classes.container}
                spacing={4}
                wrap={"nowrap"}
              >
                <Grid>
                  <LangSelector className={classes.langSelector} />
                  <Paper>
                    <Box p={4}>
                      {appInfo.image.medium && (
                        <img
                          src={appInfo.image.medium}
                          alt={appInfo.full_name}
                          className={classes.appIcon}
                        />
                      )}
                      <AuthPageStateContext.Provider value={statePack}>
                        {props.children}
                      </AuthPageStateContext.Provider>
                    </Box>
                  </Paper>
                </Grid>
                {enableSocialLogins() && statePack[0].showSocialLogins && (
                  <Grid className={classes.appInfo}>
                    <Paper>
                      <Box p={4}>
                        <SocialLogins app={app ?? "undefined"} />
                      </Box>
                    </Paper>
                  </Grid>
                )}
                {appText && (
                  <Grid className={classes.appInfo}>
                    <Paper>
                      <Box p={4}>
                        <Typography variant={"h4"}>
                          {t("app-info.title")}
                        </Typography>
                        <div
                          dangerouslySetInnerHTML={{ __html: marked(appText) }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Container>
        </Grid>
        <Grid className={classes.footer}>
          <Container maxWidth={"xs"}>
            <Box py={2}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography>
                    <Trans
                      t={t}
                      i18nKey={"footer.text"}
                      values={{
                        HOSTNAME: window.location.hostname,
                        PROVIDER: CurrentProviderConfig.legalName,
                      }}
                      components={{
                        "1": (
                          <Link
                            href={
                              "https://github.com/Samedis-care/identity-management-frontend"
                            }
                          />
                        ),
                        "2": <Link href={CurrentProviderConfig.imprintUrl} />,
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid container spacing={2} size={12}>
                  <Grid size={6}>
                    {CurrentProviderConfig.logo && (
                      <img
                        src={CurrentProviderConfig.logo}
                        alt={t("footer.logo-alt", {
                          PROVIDER: CurrentProviderConfig.legalName,
                        })}
                        className={classes.companyLogo}
                      />
                    )}
                  </Grid>
                  <Grid size={6}>
                    <Typography align={"right"}>
                      <Link onClick={showPrivacyDialog} href={"#"}>
                        {t("footer.privacy")}
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Grid>
      </Grid>
    </div>
  );
};

const AuthPageLayout = (props: AuthPageLayoutProps) => {
  const { app } = useParams<"app">();
  const theme = useTheme();
  const { data, error } = useQuery({
    queryKey: ["app-info", app],
    queryFn: () => {
      return BackendHttpClient.get<AppInfoResponse>(
        `/api/v1/app/info/${app}`,
        null,
        AuthMode.Off,
      );
    },
  });

  if (error)
    return (
      <CenteredTypography variant={"h1"} color={"error"}>
        {error.message}
      </CenteredTypography>
    );
  if (!data) return <Loader />;

  const { components_care: componentsCare, ...palette } =
    data.data.attributes.config.theme;

  const inner = {
    palette: palette,
    components: {
      CcActionButton: {
        styleOverrides: {
          button: {
            ...(componentsCare?.ui_kit?.action_button?.background_color && {
              backgroundColor:
                componentsCare.ui_kit.action_button.background_color,
              color: theme.palette.getContrastText(
                componentsCare.ui_kit.action_button.background_color,
              ),
            }),
          },
        },
      },
    },
  } as ThemeOptions;

  return (
    <AuthPageAppInfoContext.Provider value={data.data.attributes}>
      <ThemeProvider
        theme={(outer) =>
          createTheme(
            deepAssign(
              {},
              outer as unknown as Record<string, unknown>,
              inner as Record<string, unknown>,
            ),
          )
        }
      >
        <AuthPageLayoutInner {...props} />
      </ThemeProvider>
    </AuthPageAppInfoContext.Provider>
  );
};

export default React.memo(AuthPageLayout);
