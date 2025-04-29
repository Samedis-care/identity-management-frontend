import React, { useMemo } from "react";
import {
  getLocalizedReason,
  MaintenanceEntry,
} from "../../utils/MaintenanceMode";
import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { marked } from "marked";

export interface MaintenancePageEntryProps {
  entry: MaintenanceEntry;
  type: "current" | "planned";
}

const MaintenancePageEntry = (props: MaintenancePageEntryProps) => {
  const { i18n, t } = useTranslation("common");
  const { entry, type } = props;

  const infoMarkdown = useMemo(() => {
    if (!entry.reason_long) return null;
    const reason = getLocalizedReason(entry.reason_long);
    if (!reason) return null;
    return marked(reason);
  }, [entry.reason_long]);

  return (
    <Grid size={12}>
      <Grid container spacing={0}>
        <Grid size={12}>
          <Typography variant={"body2"}>
            {getLocalizedReason(entry.reason)}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant={"body2"}>
            {t("maintenance.entry.start", {
              TIMESTAMP: entry.start.toLocaleString(i18n.language),
            })}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant={"body2"}>
            {t("maintenance.entry.end", {
              TIMESTAMP: entry.end
                ? entry.end.toLocaleString(i18n.language)
                : t("maintenance.entry.end-unknown"),
            })}
          </Typography>
        </Grid>
        {type !== "current" && (
          <Grid size={12}>
            <Typography variant={"body2"}>
              {t("maintenance.explainer.planned." + entry.type)}
            </Typography>
          </Grid>
        )}
        {infoMarkdown && (
          <Grid size={12}>
            <div dangerouslySetInnerHTML={{ __html: infoMarkdown }} />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default React.memo(MaintenancePageEntry);
