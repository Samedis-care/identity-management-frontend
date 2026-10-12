import React, { useCallback, useState } from "react";
import {
  BackendDataGrid,
  DataGridNoPersist,
  FullFormDialog as FormDialog,
  ModelUnknown,
} from "components-care";
import { BackendDataGridProps } from "components-care/dist/backend-components/DataGrid";
import { Box, Button, styled, Tooltip } from "@mui/material";
import { KeyboardArrowRight as OpenIcon } from "@mui/icons-material";
import { IDataGridContentSelectRowViewProps } from "components-care/dist/standalone/DataGrid/Content/SelectRowView";
import { useTranslation } from "react-i18next";

const StyledOpenIcon = styled(OpenIcon)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const Root = styled("div")({
  height: "80vh",
});

const GridContainer = styled("div")({
  height: "calc(80vh - 64px)",
});

export type DataGridPickerProps<M extends ModelUnknown> = Omit<
  BackendDataGridProps<M>,
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

const DataGridPicker = <M extends ModelUnknown>(
  props: DataGridPickerProps<M>,
) => {
  const { onSelect, onClose, multiple, ...gridProps } = props;
  const { t } = useTranslation("common");

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
      <Root>
        <DataGridNoPersist>
          {multiple ? (
            <>
              <GridContainer>
                <BackendDataGrid
                  {...gridProps}
                  disableFooter
                  disableExport
                  onSelectionChange={handleSelectionChange}
                />
              </GridContainer>
              <Box sx={{ p: 2 }}>
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
                    <StyledOpenIcon
                      aria-label={t("data-grid.pick")}
                      onClick={() => {
                        onSelect(props.id);
                        onClose();
                      }}
                    />
                  </Tooltip>
                );
              }}
            />
          )}
        </DataGridNoPersist>
      </Root>
    </FormDialog>
  );
};

export default React.memo(DataGridPicker) as typeof DataGridPicker;
