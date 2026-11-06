import React, { useCallback, useEffect, useState } from "react";
import {
  BackendDataGrid,
  DataGridNoPersist,
  ModelRecordPartial,
  ModelUnknown,
  useDialogContext,
  useModelMutation,
} from "components-care";
import { BackendDataGridProps } from "components-care/dist/backend-components/DataGrid";
import DataGridPicker, { DataGridPickerProps } from "./DataGridPicker";

export interface DataGridMultiSelectCRUDProps<
  M extends ModelUnknown,
  OptionsM extends ModelUnknown,
> extends Omit<
  BackendDataGridProps<M>,
  | "model"
  | "disableSelection"
  | "customSelectionControl"
  | "onSelectionChange"
  | "selection"
  | "enableDelete"
  | "disableExport"
> {
  selectedModel: M;
  serializeCreate: (id: string) => ModelRecordPartial<M>;
  optionsModel: OptionsM;
  readOnly?: boolean;
  pickerProps?: Omit<
    DataGridPickerProps<OptionsM>,
    "model" | "onClose" | "onSelect" | "multiple"
  >;
}

const DataGridMultiSelectCRUD = <
  M extends ModelUnknown,
  OptionsM extends ModelUnknown,
>(
  props: DataGridMultiSelectCRUDProps<M, OptionsM>,
) => {
  const {
    selectedModel,
    optionsModel,
    serializeCreate,
    readOnly,
    pickerProps,
    ...gridProps
  } = props;
  const [pushDialog] = useDialogContext();
  const { mutateAsync: addSelected } = useModelMutation(selectedModel);
  const [refreshToken, setRefreshToken] = useState(Date.now().toString(16));
  useEffect(
    () => setRefreshToken(Date.now().toString(16)),
    [gridProps.forceRefreshToken],
  );

  const addToSelection = useCallback(
    async (ids: string[]) => {
      console.log("add to selection", ids);
      // add all ids, ignore errors
      await Promise.all(
        ids
          .map(serializeCreate)
          .map((record) => addSelected(record).catch(console.error)),
      );
      setRefreshToken(Date.now().toString(16));
    },
    [addSelected, serializeCreate],
  );

  const handleAdd = useCallback(() => {
    const close = pushDialog(
      <DataGridPicker
        {...pickerProps}
        model={optionsModel}
        onClose={() => close()}
        onSelect={addToSelection}
        multiple
      />,
    );
  }, [pushDialog, optionsModel, addToSelection, pickerProps]);

  return (
    <DataGridNoPersist>
      <BackendDataGrid
        {...gridProps}
        model={selectedModel}
        disableSelection={readOnly}
        customSelectionControl={undefined}
        onAddNew={readOnly ? undefined : handleAdd}
        enableDelete
        disableExport
        forceRefreshToken={refreshToken}
      />
    </DataGridNoPersist>
  );
};

export default React.memo(
  DataGridMultiSelectCRUD,
) as typeof DataGridMultiSelectCRUD;
