import React from "react";
import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import {
  MaintenanceType,
  useMaintenanceInfo,
} from "../../utils/MaintenanceMode";
import MaintenancePageEntry from "./MaintenancePageEntry";
import { useTranslation } from "react-i18next";

export interface MaintenancePageProps {
  dialog?: boolean;
}

const MaintenancePage = (props: MaintenancePageProps) => {
  const { dialog } = props;
  const { t } = useTranslation("common");
  const maintenanceInfo = useMaintenanceInfo();

  return (
    <Box p={dialog ? 0 : 2}>
      <Grid container spacing={0}>
        {maintenanceInfo.current && (
          <>
            <Grid size={12}>
              <Typography variant={"subtitle1"}>
                {t("maintenance.explainer.header")}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant={"body2"}>
                {t("maintenance.explainer." + maintenanceInfo.current.type)}
              </Typography>
            </Grid>
            {maintenanceInfo.current.type !== MaintenanceType.Off && (
              <Grid size={12}>
                <Typography variant={"body2"}>
                  {t("maintenance.explainer.footer")}
                </Typography>
              </Grid>
            )}
            <MaintenancePageEntry
              entry={maintenanceInfo.current}
              type={"current"}
            />
            <Grid size={12}>
              <Box pt={2} />
            </Grid>
          </>
        )}
        {maintenanceInfo.planned.length > 0 && (
          <Grid size={12}>
            <Typography variant={"subtitle1"}>
              {t("maintenance.planned-header")}
            </Typography>
          </Grid>
        )}
        {maintenanceInfo.planned.map((entry, i) => (
          <>
            {i !== 0 && (
              <Grid size={12}>
                <Box py={1}>
                  <Divider />
                </Box>
              </Grid>
            )}
            <MaintenancePageEntry entry={entry} type={"planned"} />
          </>
        ))}
      </Grid>
    </Box>
  );
};

export default React.memo(MaintenancePage);
