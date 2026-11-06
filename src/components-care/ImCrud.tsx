import React, { PropsWithChildren, useMemo } from "react";
import { CrudProps } from "components-care/dist/backend-components/CRUD";
import {
  BaseSelectorData,
  CRUD,
  DataGridLocalStoragePersist,
  DefaultErrorComponent,
  getStringLabel,
  ModelFilterType,
  ModelRecord,
  ModelUnknown,
  useLocation,
} from "components-care";
import { styled, useTheme } from "@mui/material";
import { DataGridProps } from "components-care/dist/standalone/DataGrid/DataGrid";
import { FilterType } from "components-care/dist/standalone/DataGrid/Content/FilterEntry";
import Forbidden from "../pages/Forbidden";
import GridWrapper from "./GridWrapper";

export type CrudPageProps = PropsWithChildren<
  Pick<
    // none of these depend on the model
    CrudProps<ModelUnknown>,
    "disableRouting" | "initialView" | "disableBackgroundGrid"
  >
>;

export interface ImCrudProps<M extends ModelUnknown> extends Omit<
  CrudProps<M>,
  "formProps" | "gridProps" | "forbiddenPage"
> {
  /**
   * Custom form props
   */
  formProps?: Omit<CrudProps<M>["formProps"], "errorComponent">;
  /**
   * Custom data grid props. The row label is getRowLabel.
   */
  gridProps?: Omit<CrudProps<M>["gridProps"], "getRowLabel">;
  /**
   * Names a row for assistive technology: the grid's checkbox for it is
   * "Select <label>". Takes the model's …ModelToSelectorData helper as is, or a
   * function that returns the label. Keep it a stable reference (a module-level
   * function), it is part of the grid's props.
   * null only where the CRUD shows no grid (disableBackgroundGrid with an
   * initialView): every grid names its rows explicitly, rather than through
   * the grid's default (the first text column the user happens to show).
   */
  getRowLabel: ((record: ModelRecord<M>) => string | BaseSelectorData) | null;
  /**
   * Disable grid padding
   */
  disableGridWrapper?: boolean;
}

export const useDefaultGridProps = (): Pick<
  DataGridProps,
  | "enableFilterDialogMediaQuery"
  | "getAdditionalFilters"
  | "filterLimit"
  | "sortLimit"
  | "overrideCustomData"
  | "isFilterSupported"
> => {
  const theme = useTheme();
  const gridFilterBreakpoint = theme.breakpoints.down("lg");
  const location = useLocation();

  return useMemo(
    () => ({
      enableFilterDialogMediaQuery: gridFilterBreakpoint,
      getAdditionalFilters: (data) => data,
      filterLimit: 1,
      sortLimit: 1,
      isFilterSupported: (
        dataType: ModelFilterType,
        filterType: FilterType,
        field: string,
      ): boolean => {
        if (field === "id") {
          return filterType === "equals" || filterType === "notEqual";
        }
        if (dataType === "date") {
          if (filterType === "lessThanOrEqual") return false;
          if (filterType === "greaterThanOrEqual") return false;
        } else if (dataType === "combined-string") {
          return filterType === "contains" || filterType === "notContains";
        }
        // matches not implemented by backend, nor wanted for UX reasons
        if (filterType === "matches" || filterType === "notMatches")
          return false;
        return true;
      },
      overrideCustomData: location.search
        ? Object.fromEntries(new URLSearchParams(location.search).entries())
        : undefined,
    }),
    [gridFilterBreakpoint, location.search],
  );
};

const FORM_CLASS_NAME = "ImCrud-form";

const StyledRoot = styled("div")({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  [`& .${FORM_CLASS_NAME}`]: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

const ImCrud = <M extends ModelUnknown>(
  props: Omit<ImCrudProps<M>, "customCloseHandler">,
) => {
  const defaultGridProps = useDefaultGridProps();
  const formPropsCached = useMemo<CrudProps<M>["formProps"]>(
    () => ({
      formClass: FORM_CLASS_NAME,
      ...props.formProps,
      errorComponent: DefaultErrorComponent,
    }),
    [props.formProps],
  );
  const { disableGridWrapper, getRowLabel, ...otherProps } = props;
  const gridPropsCached = useMemo<CrudProps<M>["gridProps"]>(
    () => ({
      ...defaultGridProps,
      ...props.gridProps,
      getRowLabel: getRowLabel
        ? (record) => {
            const label = getRowLabel(record);
            return typeof label === "string" ? label : getStringLabel(label);
          }
        : undefined,
    }),
    [defaultGridProps, props.gridProps, getRowLabel],
  );
  return (
    <StyledRoot>
      <DataGridLocalStoragePersist
        storageKey={"datagrid-persist-" + props.model.modelId}
      >
        <CRUD
          {...otherProps}
          formProps={formPropsCached}
          gridProps={gridPropsCached}
          gridWrapper={GridWrapper}
          forbiddenPage={Forbidden}
        />
      </DataGridLocalStoragePersist>
    </StyledRoot>
  );
};

export default React.memo(ImCrud) as typeof ImCrud;
