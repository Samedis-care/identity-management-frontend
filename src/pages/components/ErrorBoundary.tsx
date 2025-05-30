import React from "react";
import { Grid, Typography } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import * as Sentry from "@sentry/react";
import { useLocation } from "components-care";

export interface WithLocationProps {
  location: ReturnType<typeof useLocation>;
}
function withLocation<T extends WithLocationProps>(
  Component: React.ComponentType<Omit<T, "location"> & WithLocationProps>,
) {
  return function WithLocationHOC(props: Omit<T, "location">) {
    return <Component {...props} location={useLocation()} />;
  };
}

export interface ErrorBoundaryProps extends WithTranslation, WithLocationProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

const CHUNK_LOAD_ERROR = "ChunkLoadError";
const ERROR_CUSTOM_MESSAGES: Record<string, string> = {
  [CHUNK_LOAD_ERROR]: "errors.chunk-load-error",
};
const ERROR_IGNORED: string[] = [CHUNK_LOAD_ERROR];

class ErrorBoundary extends React.PureComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    if (!ERROR_IGNORED.includes(error.name)) {
      Sentry.captureException(error);
    }
    return {
      error: error,
    };
  }

  componentDidUpdate(
    prevProps: Readonly<ErrorBoundaryProps>,
    _prevState: Readonly<ErrorBoundaryState>,
    _snapshot?: unknown,
  ) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        error: null,
      });
    }
  }

  getMessage(): string {
    const { error } = this.state;
    if (!error) return "";
    if (error.name in ERROR_CUSTOM_MESSAGES) {
      return this.props.t(ERROR_CUSTOM_MESSAGES[error.name]);
    }
    return error.message;
  }

  render() {
    const { t } = this.props;
    const { error } = this.state;

    if (error) {
      return (
        <Grid
          container
          direction={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          style={{ height: "100%" }}
        >
          <Grid size={12}>
            <Typography variant={"h1"} align={"center"}>
              {t("errors.js.title")}
            </Typography>
            <Typography align={"center"}>{this.getMessage()}</Typography>
          </Grid>
        </Grid>
      );
    }
    return this.props.children;
  }
}

export default withTranslation("common")(
  withLocation<ErrorBoundaryProps>(ErrorBoundary),
);
