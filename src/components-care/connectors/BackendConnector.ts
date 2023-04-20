import {
  ApiConnector,
  ConnectorIndex2Params,
  deepAssign,
  dotsToObject,
  isObjectEmpty,
  Model,
  ModelDataTypeImageRenderer,
  ModelFieldName,
  ModelFilterType,
  ModelGetResponse,
  PageVisibility,
  ResponseMeta,
  uniqueArray,
} from "components-care";
import {
  DataGridAdditionalFilters,
  DataGridSortSetting,
  IDataGridColumnDef,
  IDataGridFieldFilter,
  IDataGridLoadDataParameters,
} from "components-care/dist/standalone/DataGrid/DataGrid";
import BackendHttpClient from "./BackendHttpClient";
import { IDataGridExporter } from "components-care/dist/standalone/DataGrid/Header";
import ExcelExportIcon from "../../components/icons/ExcelExportIcon";
import i18n from "../../i18n";
import { ModelGetResponseRelations } from "components-care/dist/backend-integration/Model/Model";
import { IFilterDef } from "components-care/dist/standalone/DataGrid/Content/FilterEntry";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { isSessionValid } from "../../pages/components/AuthProvider";

interface DataResponse {
  data: {
    attributes: Record<string, unknown>;
    links?: Record<string, string>;
    relationships?: Record<
      string,
      {
        data: { id: string; type: string }[];
      }
    >;
    id: string;
    type: string;
  };
  included?: {
    attributes: Record<string, unknown>;
    links?: Record<string, string>;
    id: string;
    type: string;
  }[];
  meta: {};
}

interface IndexResponse {
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
    links?: Record<string, string>;
  }[];
  meta: {
    total: number;
  };
}

interface ExportResponse {
  meta: {
    locale: string;
    msg: {
      name: string;
      success: boolean;
      url: string;
    };
  };
}

export type IncludedRelations<KeyT extends string> = Partial<
  Record<KeyT, [type: string, includeStr: string]>
>;
type IncludedRelationsReverse<KeyT extends ModelFieldName> = Record<
  string,
  KeyT[]
>;

export interface AdditionalBackendOptions {
  overrideRecordBase?: string;
  overrideRecordBaseDelete?: string;
  /**
   * Single record mode (index/post not available, get/put/delete without ID)
   */
  singleton?: boolean;
}

interface BackendSort {
  property: string;
  direction: "ASC" | "DESC";
}

class BackendConnector<
  KeyT extends ModelFieldName,
  RelationsKeyT extends string,
  VisibilityT extends PageVisibility,
  CustomT
> extends ApiConnector<KeyT, VisibilityT, CustomT> {
  private apiBase: string;
  includedRelations: IncludedRelations<RelationsKeyT>;
  includedRelationsReverse: IncludedRelationsReverse<RelationsKeyT>;
  additionalQueryParameters?: Record<string, unknown>;
  putTag: string | null;
  additionalOptions: AdditionalBackendOptions;
  // can be set via configureConnector
  public optionalAuth?: boolean;

  /**
   * Initializes the backend connector
   * @param controller The backend controller which should be used as endpoint
   * @param putTag Top level tag name for data in PUT/POST requests or NULL for no top level tag
   * @param includedRelations A map of field name -> relation name which should be loaded in read(...)
   *                          Example:
   *                          staff_ids -> [staff, staffs]
   *                          device_ids -> [catalog, catalogs]
   * @param additionalQueryParameters Additional GET query parameters added to every request
   * @param additionalOptions Other additional options to change the behaviour of the connector
   */
  constructor(
    controller: string,
    putTag: string | null = null,
    includedRelations: IncludedRelations<RelationsKeyT> = {},
    additionalQueryParameters?: Record<string, unknown>,
    additionalOptions?: AdditionalBackendOptions
  ) {
    super();

    this.apiBase = "/api/" + controller;
    this.putTag = putTag;
    this.includedRelations = includedRelations;
    this.includedRelationsReverse = {};
    this.additionalQueryParameters = additionalQueryParameters;
    this.additionalOptions = additionalOptions ?? {};

    if (this.additionalOptions.overrideRecordBase) {
      this.additionalOptions.overrideRecordBase =
        "/api/" + this.additionalOptions.overrideRecordBase;
    }
    if (this.additionalOptions.overrideRecordBaseDelete) {
      this.additionalOptions.overrideRecordBaseDelete =
        "/api/" + this.additionalOptions.overrideRecordBaseDelete;
    }

    if (
      this.additionalQueryParameters &&
      "include" in this.additionalQueryParameters
    ) {
      throw new Error(
        "include cannot be set via additionalQueryParameters, use includedRelations struct instead"
      );
    }

    Object.entries(this.includedRelations).forEach(([field, meta]) => {
      const type = (meta as string[2])[0];
      if (type in this.includedRelationsReverse) {
        this.includedRelationsReverse[type].push(field as RelationsKeyT);
      } else {
        this.includedRelationsReverse[type] = [field as RelationsKeyT];
      }
    });
  }

  getApiBase = (
    record: boolean,
    action: "index" | "show" | "update" | "create" | "delete"
  ): string => {
    if (!record) return this.apiBase;
    if (action === "delete" && this.additionalOptions.overrideRecordBaseDelete)
      return this.additionalOptions.overrideRecordBaseDelete;
    return this.additionalOptions.overrideRecordBase ?? this.apiBase;
  };

  getAuthMode(): AuthMode {
    return this.optionalAuth
      ? isSessionValid()
        ? AuthMode.Try
        : AuthMode.Off
      : AuthMode.On;
  }

  convertSort = (sort: DataGridSortSetting): BackendSort => ({
    property: sort.field,
    direction: sort.direction < 0 ? "DESC" : "ASC",
  });

  toAgGridFilterType = (
    filterType: ModelFilterType
  ): "text" | "date" | "datetime" | "number" | "bool" => {
    switch (filterType) {
      case "string":
      case "localized-string":
      case "enum":
        return "text";
      case "number":
        return "number";
      case "date":
        return "date";
      case "datetime":
        return "datetime";
      case "boolean":
        return "bool";
      default:
        throw new Error("not supported by backend");
    }
  };

  toAgGridFilterDef = (
    filter: IFilterDef,
    filterType: "text" | "date" | "datetime" | "number" | "bool"
  ) => ({
    filterType,
    type: filter.type,
    [filterType === "date"
      ? "dateFrom"
      : filterType === "datetime"
      ? "dateTimeFrom"
      : "filter"]: ["inSet", "notInSet"].includes(filter.type)
      ? filter.value1.split(",")
      : filter.value1,
    [filterType === "date"
      ? "dateTo"
      : filterType === "datetime"
      ? "dateTimeTo"
      : "filterTo"]: filter.value2 || undefined,
  });

  isFilterValid = (filter: IFilterDef | undefined): boolean => {
    if (!filter) return false;
    if (!filter.value1) return false;
    if (filter.type === "inRange" && !filter.value2) return false;
    return true;
  };

  getIndexParams(
    page: number | null,
    rows: number | null,
    sort: DataGridSortSetting[],
    quickFilter: string,
    gridFilter: IDataGridFieldFilter,
    additionalFilters: DataGridAdditionalFilters,
    extraParams?: Record<string, unknown>,
    model?: Model<KeyT, VisibilityT, CustomT>,
    columns?: IDataGridColumnDef[],
    pageIsOffset?: boolean
  ): Record<string, unknown> {
    if (!extraParams) extraParams = {};
    const dataGridColumns =
      gridFilter && (columns ?? model?.toDataGridColumnDefinition(true));

    return Object.assign(
      {
        [pageIsOffset ? "page[padding]" : "page[number]"]: page ?? undefined,
        "page[limit]": rows ?? undefined,
        sort: JSON.stringify(sort.map(this.convertSort)),
        quickfilter: quickFilter,
        gridfilter: Object.fromEntries(
          Object.entries(gridFilter).map(([field, filter]) => {
            if (!this.isFilterValid(filter)) return [field, undefined];
            const filterTypeCC = dataGridColumns!.find(
              (entry) => entry.field === field
            )!.type;
            const filterType = this.toAgGridFilterType(filterTypeCC);
            const agGridFilter = this.isFilterValid(filter.nextFilter)
              ? {
                  condition1: this.toAgGridFilterDef(filter, filterType),
                  condition2: this.toAgGridFilterDef(
                    filter.nextFilter!,
                    filterType
                  ),
                  filterType,
                  operator: filter.nextFilterType!.toUpperCase(),
                }
              : this.toAgGridFilterDef(filter, filterType);
            return [
              filterTypeCC === "localized-string"
                ? `${field.replace("_translations", "")}.${
                    i18n.language.split("-")[0]
                  }`
                : field,
              agGridFilter,
            ];
          })
        ),
        ...additionalFilters,
      },
      extraParams,
      this.additionalQueryParameters
    );
  }

  async index(
    params: Partial<IDataGridLoadDataParameters> | undefined,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<[Record<KeyT, unknown>[], ResponseMeta, unknown?]> {
    // load reasonable defaults if nothing is set
    if (!params) params = {};
    if (!params.page) params.page = 1;
    if (!params.rows) params.rows = 25;
    if (!params.sort) params.sort = [];
    if (!params.quickFilter) params.quickFilter = "";
    if (!params.fieldFilter) params.fieldFilter = {};
    if (!params.additionalFilters) params.additionalFilters = {};

    const indexParams = this.getIndexParams(
      params.page,
      params.rows,
      params.sort,
      params.quickFilter,
      params.fieldFilter,
      params.additionalFilters,
      undefined,
      model
    );

    return this.indexCommon(indexParams, model);
  }

  public async index2(
    params: ConnectorIndex2Params,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<[Record<string, unknown>[], ResponseMeta, unknown?]> {
    // load reasonable defaults if nothing is set
    if (!params.sort) params.sort = [];
    if (!params.quickFilter) params.quickFilter = "";
    if (!params.fieldFilter) params.fieldFilter = {};
    if (!params.additionalFilters) params.additionalFilters = {};

    const indexParams = this.getIndexParams(
      params.offset,
      params.rows,
      params.sort,
      params.quickFilter,
      params.fieldFilter,
      params.additionalFilters,
      undefined,
      model,
      undefined,
      true
    );

    return this.indexCommon(indexParams, model);
  }

  private async indexCommon(
    indexParams: Record<string, unknown>,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<[Record<KeyT, unknown>[], ResponseMeta, unknown?]> {
    if (this.additionalOptions.singleton)
      throw new Error("Backend connector in singleton mode, index disabled");

    const resp = await BackendHttpClient.get<IndexResponse>(
      this.getApiBase(false, "index"),
      indexParams,
      this.getAuthMode()
    );

    return [
      await Promise.all(
        resp.data.map((entry) =>
          this.completeAttributes(
            Object.assign({}, entry.attributes, { id: entry.id }, entry.links),
            model
          )
        )
      ),
      {
        totalRows: resp.meta.total,
      },
      resp.meta,
    ];
  }

  getQueryParameters() {
    return isObjectEmpty(this.includedRelations)
      ? this.additionalQueryParameters ?? null
      : {
          ...this.additionalQueryParameters,
          include: uniqueArray(
            Object.values(this.includedRelations).map(
              (entry) => (entry as string[2])[1]
            )
          ).join(","),
        };
  }

  async processDataResponse(
    resp: DataResponse,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<ModelGetResponse<KeyT>> {
    const included: ModelGetResponseRelations<KeyT> = {};
    if (resp.included) {
      resp.included.forEach((entry) => {
        const data = Object.assign(
          {},
          entry.attributes,
          { id: entry.id },
          entry.links
        );
        const listOfFields = this.includedRelationsReverse[entry.type] ?? [];
        listOfFields.forEach((field) => {
          if (field in included) {
            included[field as unknown as KeyT]!.push(data);
          } else {
            included[field as unknown as KeyT] = [data];
          }
        });
      });
    }

    const relationIds: Partial<Record<KeyT, string[]>> = {};
    if ("relationships" in resp.data && resp.data.relationships) {
      Object.values(resp.data.relationships)
        .map((data) => data.data)
        .flat()
        .filter((entry) => entry)
        .forEach((entry) => {
          const fieldName = entry.type + "_ids";
          if (fieldName in relationIds) {
            relationIds[fieldName as KeyT]!.push(entry.id);
          } else {
            relationIds[fieldName as KeyT] = [entry.id];
          }
        });
    }

    return [
      await this.completeAttributes(
        Object.assign(
          {},
          relationIds,
          resp.data.attributes,
          { id: resp.data.id },
          resp.data.links
        ),
        model
      ),
      included,
      resp.meta,
    ];
  }

  async completeAttributes(
    data: Record<string, unknown>,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<Record<KeyT, unknown>> {
    if (!model) return data;

    const defaults: Record<string, unknown> = {};

    // obtain defaults
    for (const key in model.fields) {
      if (!Object.prototype.hasOwnProperty.call(model.fields, key)) continue;

      defaults[key] = await (
        model.fields[key].getDefaultValue ??
        model.fields[key].type.getDefaultValue
      )();
    }

    // overwrite defaults by actual data
    return deepAssign({}, dotsToObject(defaults), data);
  }

  async create(
    data: Record<string, unknown>,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<ModelGetResponse<KeyT>> {
    if (this.additionalOptions.singleton)
      throw new Error("BackendConnector is in singleton mode, create disabled");

    const resp = await BackendHttpClient.post<DataResponse>(
      this.getApiBase(true, "create"),
      this.getQueryParameters(),
      this.putTag ? { [this.putTag]: data } : { data },
      this.getAuthMode()
    );
    return this.processDataResponse(resp, model);
  }

  async read(
    id: string,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<ModelGetResponse<KeyT>> {
    const resp = await BackendHttpClient.get<DataResponse>(
      this.additionalOptions.singleton
        ? this.getApiBase(true, "show")
        : `${this.getApiBase(true, "show")}/${id}`,
      this.getQueryParameters(),
      this.getAuthMode()
    );
    return this.processDataResponse(resp, model);
  }

  async update(
    data: Record<ModelFieldName, unknown>,
    model?: Model<KeyT, VisibilityT, CustomT>
  ): Promise<ModelGetResponse<KeyT>> {
    // remove not updated images
    if (model) {
      for (const keyRaw in data) {
        if (!Object.prototype.hasOwnProperty.call(data, keyRaw)) continue;
        const key = keyRaw as KeyT;
        if (model.fields[key]?.type instanceof ModelDataTypeImageRenderer) {
          if (data[key] && !(data[key] as string).startsWith("data:")) {
            delete data[key];
          }
        }
      }
    }

    const resp = await BackendHttpClient.put<DataResponse>(
      this.additionalOptions.singleton
        ? this.getApiBase(true, "update")
        : `${this.getApiBase(true, "update")}/${data.id}`,
      this.getQueryParameters(),
      this.putTag ? { [this.putTag]: data } : { data },
      this.getAuthMode()
    );
    return this.processDataResponse(resp, model);
  }

  async delete(id: string): Promise<void> {
    return BackendHttpClient.delete(
      this.additionalOptions.singleton
        ? this.getApiBase(true, "delete")
        : `${this.getApiBase(true, "delete")}/${id}`,
      this.additionalQueryParameters ?? null,
      this.getAuthMode()
    );
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    return BackendHttpClient.delete(
      `${this.getApiBase(true, "delete")}/${ids.join(",")}`,
      this.additionalQueryParameters ?? null,
      this.getAuthMode()
    );
  }

  dataGridExporters: IDataGridExporter<unknown>[] = [
    {
      id: "excel",
      icon: ExcelExportIcon,
      getLabel: () => i18n.t("data-grid.export.excel.label")!,
      getWorkingLabel: () => i18n.t("data-grid.export.excel.working")!,
      getReadyLabel: () => i18n.t("data-grid.export.excel.ready")!,
      getErrorLabel: () => i18n.t("data-grid.export.excel.error")!,
      onRequest: async (
        quickFilter: string,
        additionalFilters: DataGridAdditionalFilters,
        fieldFilter: IDataGridFieldFilter,
        sort: DataGridSortSetting[],
        columns: IDataGridColumnDef[]
      ): Promise<unknown> => {
        const indexParams = this.getIndexParams(
          null,
          null,
          sort,
          quickFilter,
          fieldFilter,
          additionalFilters,
          {
            "export[columns]": columns.map((col) => col.field),
            locale: i18n.language,
          },
          undefined,
          columns
        );

        const resp = await BackendHttpClient.get<ExportResponse>(
          this.getApiBase(false, "index") + ".xlsx",
          indexParams,
          this.getAuthMode()
        );

        return resp.meta.msg.url;
      },
      onDownload: (data: unknown) => {
        window.open(data as string);
      },
    },
  ];

  setApiEndpoint(url: string): void {
    this.apiBase = "/api/" + url;
  }
}

export default BackendConnector;
