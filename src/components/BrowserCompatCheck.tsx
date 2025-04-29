import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import * as Sentry from "@sentry/react";

export interface BrowserCompatCheckProps {
  children: React.ReactElement;
}

const BrowserCompatCheck = (props: BrowserCompatCheckProps) => {
  const { t } = useTranslation("common");
  const errors = useMemo(() => {
    const err: string[] = [];
    if (!localStorage) err.push("browser-compat.local-storage");
    if (!sessionStorage) err.push("browser-compat.session-storage");
    return err;
  }, []);

  useEffect(() => {
    if (errors.length === 0) return;
    Sentry.captureMessage("Browser unsupported. Reasons: " + errors.join(", "));
  }, [errors]);

  if (errors.length > 0) {
    return (
      <Container maxWidth={"md"}>
        <Box p={2}>
          <Paper>
            <Box p={2}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant={"h1"}>
                    {t("browser-compat.title")}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <ul>
                    {errors.map((err, idx) => (
                      <li key={idx.toString(16)}>
                        <Typography>{t(err)}</Typography>
                      </li>
                    ))}
                  </ul>
                </Grid>
                <Grid size={12}>{t("browser-compat.info")}</Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return props.children;
};

export default React.memo(BrowserCompatCheck);
