import { Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import { useFormContext } from "components-care";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

const ModuleSelector = () => {
  const { t } = useTranslation("actors");
  const { values, setFieldValue } = useFormContext();
  const available = values.modules_available as string[] | null;
  const selected = values.modules_selected as string[] | null;

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const name = evt.currentTarget.name;
      const newSelected = selected?.filter((sel) => sel !== name) ?? [];
      if (checked) newSelected.push(name);
      setFieldValue("modules_selected", newSelected);
    },
    [selected, setFieldValue]
  );

  return (
    <>
      {available && available.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>{t("fields.modules_available")}</Typography>
          </Grid>
          {available.map((module) => (
            <Grid item key={module} xs={12}>
              <FormControlLabel
                control={<Checkbox onChange={handleChange} />}
                label={module}
                checked={selected?.includes(module)}
                name={module}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default React.memo(ModuleSelector);
