import React, { PropsWithChildren, useMemo } from "react";
import { CrudProps } from "components-care/dist/backend-components/CRUD";
import {
  CRUD,
  DataGridLocalStoragePersist,
  DefaultErrorComponent,
  ModelFieldName,
  ModelFilterType,
  PageVisibility,
  useLocation,
} from "components-care";
import { useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { DataGridProps } from "components-care/dist/standalone/DataGrid/DataGrid";
import { FilterType } from "components-care/dist/standalone/DataGrid/Content/FilterEntry";
import Forbidden from "../pages/Forbidden";
import GridWrapper from "./GridWrapper";

export type CrudPageProps = PropsWithChildren<
  Pick<
    CrudProps<ModelFieldName, PageVisibility, unknown>,
    "disableRouting" | "initialView" | "disableBackgroundGrid"
  >
>;

export interface ImCrudProps<
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT,
> extends Omit<
  CrudProps<KeyT, VisibilityT, CustomT>,
  "formProps" | "gridProps" | "forbiddenPage"
> {
  /**
   * Custom form props
   */
  formProps?: Omit<
    CrudProps<KeyT, VisibilityT, CustomT>["formProps"],
    "errorComponent"
  >;
  /**
   * Custom data grid props
   */
  gridProps?: CrudProps<KeyT, VisibilityT, CustomT>["gridProps"];
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

const useStyles = makeStyles({ name: "ImCrud" })({
  form: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

const ImCrud = <
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT,
>(
  props: Omit<ImCrudProps<KeyT, VisibilityT, CustomT>, "customCloseHandler">,
) => {
  const defaultGridProps = useDefaultGridProps();
  const { classes } = useStyles();
  const formPropsCached = useMemo<
    CrudProps<KeyT, VisibilityT, CustomT>["formProps"]
  >(
    () => ({
      formClass: classes.form,
      ...props.formProps,
      errorComponent: DefaultErrorComponent,
    }),
    [props.formProps, classes.form],
  );
  const gridPropsCached = useMemo<
    CrudProps<KeyT, VisibilityT, CustomT>["gridProps"]
  >(
    () => ({
      ...defaultGridProps,
      ...props.gridProps,
    }),
    [defaultGridProps, props.gridProps],
  );
  const { disableGridWrapper, ...otherProps } = props;
  return (
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
  );
};

export default React.memo(ImCrud) as typeof ImCrud;
