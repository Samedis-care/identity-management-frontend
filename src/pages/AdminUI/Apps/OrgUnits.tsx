import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackendDataGrid,
  DataGridLocalStoragePersist,
  DefaultErrorComponent,
  Form,
  InfoBox,
  Loader,
  ModelRecord,
  throwError,
  useParams,
  useNavigate,
  useLocation,
} from "components-care";
import GridWrapper from "../../../components-care/GridWrapper";
import { gridStorageKey } from "../../../components-care/ImCrud";
import useAsyncMemo from "components-care/dist/utils/useAsyncMemo";
import { AppBar, Box, Tab, Tabs, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import OrgUnitForm from "./OrgUnitForm";
import { useOrganizationModel } from "../../../components-care/models/OrganizationModel";
import DrillDownBar, { DrillDownCrumb } from "../../../components/DrillDownBar";
import ErrorInfo from "../../Account/components/ErrorInfo";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";
import type { OrganizationModelType } from "../../../components-care/models/OrganizationModel";

const OrgUnitRoot = styled(Box)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "& > :last-child": { flexGrow: 1, minHeight: 0 },
});

const Intro = styled("div")(({ theme }) => ({
  margin: theme.spacing(2, 2, 0),
}));

// the app, the root of the tree, has no record of its own, so no id
const APP_ACTOR: Pick<
  ModelRecord<OrganizationModelType>,
  "leaf" | "insertable_child_types"
> & { id?: undefined } = {
  leaf: false,
  insertable_child_types: ["ou", "group"],
};

export interface OrgUnitTreeParams {
  /** form of a unit */
  form: React.ComponentType<PageProps<OrganizationModelType, CrudFormProps>>;
  /** where the grid keeps its settings, see ImCrud storageKey */
  storageKey: string;
  /** crumbs in front of the tree path, e.g. the tenant */
  crumbsPrefix?: DrillDownCrumb[];
  /** hint above the grid on the top level */
  intro?: React.ReactNode;
}

export const useOrgUnitTree = (params: OrgUnitTreeParams) => {
  const { form, storageKey, crumbsPrefix, intro } = params;
  const { t } = useTranslation("ous");
  const { app } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"edit" | "children">("children");
  const handleTabChange = useCallback(
    (_evt: React.SyntheticEvent, newValue: "edit" | "children") => {
      setTab(newValue);
    },
    [],
  );
  const [pathPrefix, path] = useMemo(() => {
    const pathPrefix = pathname.substring(0, pathname.indexOf("/ous") + 4);
    const path = pathname
      .substring(pathPrefix.length)
      .split("/")
      .filter((entry) => entry);
    return [pathPrefix, path];
  }, [pathname]);
  const current = path.length === 0 ? null : path[path.length - 1];
  const parent =
    path.length === 0 ? null : path.length === 1 ? app : path[path.length - 2];
  const fetchModel = useOrganizationModel();
  const { value: currentRecord, error: currentRecordError } =
    useAsyncMemo(async () => {
      if (current == null) return APP_ACTOR;
      if (current === "new") return false;
      const [record] = await fetchModel.getCached(current ?? app);
      return record;
    }, [current]);
  const { value: parentRecord, error: parentRecordError } =
    useAsyncMemo(async () => {
      if (!parent) return false;
      if (parent === app) return APP_ACTOR;
      const [record] = await fetchModel.getCached(parent);
      return record;
    }, [parent, app]);
  // switch to edit tab if record is leaf
  useEffect(() => {
    if (!currentRecord) return;
    if (currentRecord.leaf) setTab("edit");
  }, [currentRecord]);
  // switch to children tab if no parent
  useEffect(() => {
    if (parentRecord !== false) return;
    setTab("children");
  }, [parentRecord]);
  // switch to edit tab if new
  useEffect(() => {
    if (current !== "new") return;
    setTab("edit");
  }, [current]);
  // generate path; the crumbs show "…" for a title that failed to load
  const { value: pathData } = useAsyncMemo(
    async () => {
      return Object.fromEntries(
        (
          await Promise.all(
            path
              .filter((id) => id !== "new")
              .map((id) => fetchModel.getCached(id)),
          )
        ).map((entry) => [entry[0].id, entry[0].title]),
      );
    },
    [path],
    true,
  );
  const model = useOrganizationModel(
    current,
    true,
    parentRecord ? parentRecord.insertable_child_types : null,
  );
  const openUnit = useCallback(
    (id: string) => navigate(`${pathname}/${id}`),
    [navigate, pathname],
  );
  const addUnit = useCallback(
    () => navigate(`${pathname}/new`),
    [navigate, pathname],
  );
  const loadError = currentRecordError ?? parentRecordError;
  if (loadError) return <ErrorInfo message={loadError.message} />;
  if (currentRecord == null || parentRecord == null) return <Loader />;
  const grid = (
    <GridWrapper>
      <DataGridLocalStoragePersist storageKey={gridStorageKey(storageKey)}>
        <BackendDataGrid
          model={model}
          onEdit={openUnit}
          onAddNew={addUnit}
          enableDelete
          forceRefreshToken={current ?? "app"}
        />
      </DataGridLocalStoragePersist>
    </GridWrapper>
  );
  // top level: just the grid, the page (or its tab) says what it lists
  if (path.length === 0)
    return (
      <OrgUnitRoot>
        {intro && <Intro>{intro}</Intro>}
        {grid}
      </OrgUnitRoot>
    );
  // an opened unit: path back instead of the page tabs, then its own tabs
  const crumbs: DrillDownCrumb[] = [
    ...(crumbsPrefix ?? []),
    { label: t("ous:breadcrumbs.root"), to: pathPrefix },
    ...path.map((id, idx, arr) => ({
      label: id === "new" ? t("ous:breadcrumbs.new") : (pathData?.[id] ?? "…"),
      to:
        idx === arr.length - 1
          ? undefined
          : `${pathPrefix}/${arr.slice(0, idx + 1).join("/")}`,
    })),
  ];
  return (
    <OrgUnitRoot>
      <DrillDownBar crumbs={crumbs} />
      <AppBar position={"static"}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab
            value={"children"}
            label={t("ous:tab.children")}
            disabled={current === "new"}
          />
          <Tab
            value={"edit"}
            label={t("ous:tab.edit")}
            disabled={!parentRecord}
          />
        </Tabs>
      </AppBar>
      {tab === "edit" ? (
        <Form
          id={currentRecord ? (currentRecord.id ?? null) : null}
          model={model}
          initialRecord={parent ? { parent_id: parent } : undefined}
          errorComponent={DefaultErrorComponent}
          renderConditionally
          onSubmit={(data) => {
            const id = data.id;
            navigate(
              path.map((part) => (part === "new" ? id : part)).join("/"),
            );
          }}
          customProps={{
            goBack: () =>
              navigate(
                `${pathPrefix}/${path.slice(0, path.length - 1).join("/")}`,
              ),
            open: () => throwError("open not implemented"),
            hasCustomSubmitHandler: false,
          }}
        >
          {form}
        </Form>
      ) : (
        grid
      )}
    </OrgUnitRoot>
  );
};

const OrgUnits = () => {
  const { t } = useTranslation("ous");
  return useOrgUnitTree({
    form: OrgUnitForm,
    storageKey: "app-ous",
    intro: (
      <InfoBox
        status={"info"}
        heading={t("template-info-heading")}
        message={t("template-info")}
        expanded
      />
    ),
  });
};

export default React.memo(OrgUnits);
