import React, { useCallback, useState } from "react";
import {
  BackendDataGrid,
  DataGridNoPersist,
  FullFormDialog as FormDialog,
  ModelFieldName,
  PageVisibility,
} from "components-care";
import { BackendDataGridProps } from "components-care/dist/backend-components/DataGrid";
import { Box, Button, Tooltip } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { KeyboardArrowRight as OpenIcon } from "@mui/icons-material";
import { IDataGridContentSelectRowViewProps } from "components-care/dist/standalone/DataGrid/Content/SelectRowView";
import { useTranslation } from "react-i18next";

const useOpenStyles = makeStyles()((theme) => ({
  root: {
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

const useStyles = makeStyles()({
  root: {
    height: "80vh",
  },
  gridContainer: {
    height: "calc(80vh - 64px)",
  },
});

export type DataGridPickerProps<
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT,
> = Omit<
  BackendDataGridProps<KeyT, VisibilityT, CustomT>,
  | "disableSelection"
  | "disableFooter"
  | "customSelectionControl"
  | "onSelectionChange"
  | "prohibitMultiSelect"
> &
  (
    | {
        onSelect: (id: string) => void;
        multiple?: false;
      }
    | {
        onSelect: (ids: string[]) => void;
        multiple: true;
      }
  ) & { onClose: () => void };

const DataGridPicker = <
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT,
>(
  props: DataGridPickerProps<KeyT, VisibilityT, CustomT>,
) => {
  const { onSelect, onClose, multiple, ...gridProps } = props;
  const { t } = useTranslation("common");
  const { classes: openStyles } = useOpenStyles();
  const { classes } = useStyles();

  const [selected, setSelected] = useState<string[]>([]);
  const handleSelectionChange = useCallback((_: boolean, ids: string[]) => {
    setSelected(ids);
  }, []);
  const handleDone = useCallback(() => {
    (onSelect as (ids: string[]) => void)(selected);
    onClose();
  }, [onSelect, selected, onClose]);

  return (
    <FormDialog onClose={onClose}>
      <div className={classes.root}>
        <DataGridNoPersist>
          {multiple ? (
            <>
              <div className={classes.gridContainer}>
                <BackendDataGrid
                  {...gridProps}
                  disableFooter
                  disableExport
                  onSelectionChange={handleSelectionChange}
                />
              </div>
              <Box p={2}>
                <Button onClick={handleDone} variant={"contained"}>
                  Add
                </Button>
              </Box>
            </>
          ) : (
            <BackendDataGrid
              {...gridProps}
              disableSelection
              disableFooter
              disableExport
              customSelectionControl={(
                props: IDataGridContentSelectRowViewProps,
              ) => {
                return (
                  <Tooltip title={t("data-grid.pick") ?? ""}>
                    <OpenIcon
                      classes={openStyles}
                      onClick={() => {
                        (onSelect as (id: string) => void)(props.id);
                        onClose();
                      }}
                    />
                  </Tooltip>
                );
              }}
            />
          )}
        </DataGridNoPersist>
      </div>
    </FormDialog>
  );
};

export default React.memo(DataGridPicker) as typeof DataGridPicker;
