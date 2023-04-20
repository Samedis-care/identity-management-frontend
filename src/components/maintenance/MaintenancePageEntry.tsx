import React, { useMemo } from "react";
import {
  getLocalizedReason,
  MaintenanceEntry,
} from "../../utils/MaintenanceMode";
import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import marked from "marked";

export interface MaintenancePageEntryProps {
  entry: MaintenanceEntry;
  type: "current" | "planned";
}

const MaintenancePageEntry = (props: MaintenancePageEntryProps) => {
  const { i18n, t } = useTranslation("common");
  const { entry, type } = props;

  const infoMarkdown = useMemo(
    () =>
      entry.reason_long ? marked(getLocalizedReason(entry.reason_long)) : null,
    [entry.reason_long]
  );

  return (
    <Grid item xs={12}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Typography variant={"body2"}>
            {getLocalizedReason(entry.reason)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"body2"}>
            {t("maintenance.entry.start", {
              TIMESTAMP: entry.start.toLocaleString(i18n.language),
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"body2"}>
            {t("maintenance.entry.end", {
              TIMESTAMP: entry.end
                ? entry.end.toLocaleString(i18n.language)
                : t("maintenance.entry.end-unknown"),
            })}
          </Typography>
        </Grid>
        {type !== "current" && (
          <Grid item xs={12}>
            <Typography variant={"body2"}>
              {t("maintenance.explainer.planned." + entry.type)}
            </Typography>
          </Grid>
        )}
        {infoMarkdown && (
          <Grid item xs={12}>
            <div dangerouslySetInnerHTML={{ __html: infoMarkdown }} />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default React.memo(MaintenancePageEntry);
