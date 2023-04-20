import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Connector,
  ConnectorIndex2Params,
  DataGrid,
  DataGridNoPersist,
  filterSortPaginate,
  Loader,
  Model,
  ModelFieldName,
  PageVisibility,
  renderDataGridRecordUsingModel,
} from "components-care";
import {
  DataGridData,
  DataGridProps,
  DataGridRowData,
  IDataGridLoadDataParameters,
} from "components-care/dist/standalone/DataGrid/DataGrid";
import useLazyCrudConnector, {
  extractLazyCrudConnectorParams,
  UseLazyCrudConnectorParams,
} from "components-care/dist/backend-components/Form/useLazyCrudConnector";
import useAsyncMemo from "components-care/dist/utils/useAsyncMemo";

export interface DataGridMultiSelectCRUDProps<
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT
> extends UseLazyCrudConnectorParams<KeyT, VisibilityT, CustomT>,
    Omit<
      DataGridProps,
      | "columns"
      | "loadData"
      | "disableSelection"
      | "prohibitMultiSelect"
      | "customSelectionControl"
      | "onSelectionChange"
      | "selection"
    > {
  model: Model<KeyT, VisibilityT, CustomT>;
  readOnly?: boolean;
  getIdOfRecord: (record: Record<string, unknown>) => string;
  serializeCreate: (id: string) => Record<string, unknown>;
}

const DataGridMultiSelectCRUD = <
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT
>(
  props: DataGridMultiSelectCRUDProps<KeyT, VisibilityT, CustomT>
) => {
  // This is a CRUD version of BackendDataGridMultiSelect from Components-Care
  const [lazyCrudParams, otherProps] = extractLazyCrudConnectorParams<
    KeyT,
    VisibilityT,
    CustomT,
    undefined,
    typeof props
  >(props);
  const { model, readOnly, getIdOfRecord, serializeCreate, ...gridProps } =
    otherProps;
  const { connector: relationshipConnector } =
    useLazyCrudConnector(lazyCrudParams);
  const [refreshToken, setRefreshToken] = useState(new Date().toISOString());
  const [initialSelectionChangeReceived, setInitialSelectionChangeReceived] =
    useState(false);
  const relationshipIdMap = useRef<Record<string, string>>({});
  const [relationshipRecords, relationshipMeta] =
    useAsyncMemo(
      () =>
        relationshipConnector.index(
          { rows: Number.MAX_SAFE_INTEGER, page: 0 },
          model
        ),
      []
    ) ?? [];

  const [selection, setSelection] = useState<string[]>([]);
  // update selection when new data fetched
  useEffect(() => {
    if (!relationshipRecords) return;
    relationshipIdMap.current = Object.fromEntries(
      relationshipRecords.map((record) => [
        getIdOfRecord(record),
        record.id as string,
      ])
    );
    setSelection(relationshipRecords.map(getIdOfRecord));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relationshipRecords]);

  // developer warning
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      model.connector.index2 === Connector.prototype.index2
    ) {
      console.warn(
        "[Components-Care] [DataGridMultiSelectCRUD] Backend connector does not support index2 function, offset based pagination will be emulated (inefficient)"
      );
    }
  }, [model]);

  const refreshGrid = useCallback(() => {
    setRefreshToken(new Date().toISOString());
  }, []);

  // handle force refresh token
  useEffect(refreshGrid, [refreshGrid, gridProps.forceRefreshToken]);

  if (!relationshipRecords || !relationshipMeta) return <Loader />;
  return (
    <DataGridNoPersist>
      <DataGrid
        {...gridProps}
        columns={model.toDataGridColumnDefinition()}
        forceRefreshToken={refreshToken}
        disableSelection={false}
        prohibitMultiSelect={false}
        customSelectionControl={undefined}
        onSelectionChange={(invert, newIds) => {
          if (!initialSelectionChangeReceived) {
            setInitialSelectionChangeReceived(true);
            return;
          }
          setSelection((oldIds) => {
            if (readOnly) return [...oldIds];
            const removedIds = oldIds.filter(
              (oldId) => !newIds.includes(oldId)
            );
            const addedIds = newIds.filter((newId) => !oldIds.includes(newId));

            (async () => {
              await Promise.all([
                ...removedIds.map((removeId) =>
                  relationshipConnector.delete(
                    relationshipIdMap.current[removeId],
                    model
                  )
                ),
                ...addedIds
                  .map((addId) =>
                    relationshipConnector.create(serializeCreate(addId), model)
                  )
                  .map(async (promise) => {
                    const [result] = await promise;
                    relationshipIdMap.current[getIdOfRecord(result)] =
                      result.id as string;
                  }),
              ]);
              removedIds.forEach((id) => {
                delete relationshipIdMap.current[id];
              });
            })();

            return newIds;
          });
        }}
        selection={[false, selection]}
        loadData={async (
          params: IDataGridLoadDataParameters
        ): Promise<DataGridData> => {
          if (!relationshipRecords || !relationshipMeta)
            throw new Error("Relationship data not loaded");
          const [relationshipRecordsFiltered, relationshipRecordFilteredCount] =
            filterSortPaginate(
              (relationshipRecords as DataGridRowData[]).map((record) => ({
                ...record,
                id: getIdOfRecord(record),
              })),
              params,
              model.toDataGridColumnDefinition()
            );
          const requestedOffset =
            (params.page - 1) * params.rows - relationshipRecordFilteredCount;
          const [dataRecords, dataMeta] = await model.index2({
            ...params,
            fieldFilter: {
              ...params.fieldFilter,
              id: {
                type: "notInSet",
                value1: relationshipRecords.map(getIdOfRecord).join(","),
                value2: "",
              },
            },
            offset: Math.max(requestedOffset, 0),
            rows: Math.max(requestedOffset + params.rows, 0),
          } as ConnectorIndex2Params);
          return {
            rowsTotal:
              (dataMeta.filteredRows != null
                ? relationshipMeta.totalRows
                : relationshipRecordFilteredCount) + dataMeta.totalRows,
            rowsFiltered:
              dataMeta.filteredRows != null
                ? relationshipRecordFilteredCount + dataMeta.totalRows
                : undefined,
            rows: relationshipRecordsFiltered
              .concat(dataRecords as DataGridRowData[])
              .map(renderDataGridRecordUsingModel(model, refreshGrid)),
          };
        }}
      />
    </DataGridNoPersist>
  );
};

export default React.memo(
  DataGridMultiSelectCRUD
) as typeof DataGridMultiSelectCRUD;
