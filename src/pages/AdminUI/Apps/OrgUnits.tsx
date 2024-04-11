import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackendDataGrid,
  DefaultErrorComponent,
  Form,
  Loader,
  throwError,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "components-care";
import GridWrapper from "../../../components-care/GridWrapper";
import useAsyncMemo from "components-care/dist/utils/useAsyncMemo";
import {
  AppBar,
  Box,
  Breadcrumbs,
  Grid,
  Link as MuiLink,
  Tab,
  Tabs,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useTranslation } from "react-i18next";
import OrgUnitForm from "./OrgUnitForm";
import {
  OrganizationModel,
  useOrganizationModel,
} from "../../../components-care/models/OrganizationModel";
import FormPagePaper from "../../../components/FormPagePaper";
import { PageProps } from "components-care/dist/backend-components/Form/Form";
import { CrudFormProps } from "components-care/dist/backend-components/CRUD";

const useStyles = makeStyles()({
  root: {
    height: "100%",
  },
  content: {
    height: "100%",
  },
});

const APP_ACTOR: Record<string, unknown> = {
  leaf: false,
  insertable_child_types: ["ou", "group"],
};

export const useOrgUnitTree = (
  form: React.ComponentType<
    PageProps<
      keyof ReturnType<typeof OrganizationModel>["fields"],
      CrudFormProps
    >
  >,
) => {
  const { classes } = useStyles();
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
    const pathPrefix = pathname.substr(0, pathname.indexOf("/ous") + 4);
    const path = pathname
      .substr(pathPrefix.length)
      .split("/")
      .filter((entry) => entry);
    return [pathPrefix, path];
  }, [pathname]);
  const current = path.length === 0 ? null : path[path.length - 1];
  const parent =
    path.length === 0 ? null : path.length === 1 ? app : path[path.length - 2];
  const fetchModel = useOrganizationModel();
  const currentRecord = useAsyncMemo(async () => {
    if (current == null) return APP_ACTOR;
    if (current === "new") return false;
    const [record] = await fetchModel.getCached(current ?? app);
    return record as Record<string, unknown>;
  }, [current]);
  const parentRecord = useAsyncMemo(async () => {
    if (!parent) return false;
    if (parent === app) return APP_ACTOR;
    const [record] = await fetchModel.getCached(parent);
    return record as Record<string, unknown>;
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
  // generate path
  const pathData = useAsyncMemo(
    async () => {
      return Object.fromEntries(
        (
          await Promise.all(
            path
              .filter((id) => id !== "new")
              .map((id) => fetchModel.getCached(id)),
          )
        ).map((entry) => [entry[0].id, entry[0].title]),
      ) as Record<string, string>;
    },
    [path],
    true,
  );
  const model = useOrganizationModel(
    current,
    true,
    parentRecord ? (parentRecord.insertable_child_types as string[]) : null,
  );
  if (currentRecord == null || parentRecord == null) return <Loader />;
  return (
    <Box p={2} className={classes.root}>
      <Grid
        container
        spacing={2}
        direction={"column"}
        wrap={"nowrap"}
        className={classes.root}
      >
        <Grid item>
          <FormPagePaper>
            <Breadcrumbs>
              <MuiLink key={"root"} to={pathPrefix} component={Link}>
                {t("ous:breadcrumbs.root")}
              </MuiLink>
              {pathData &&
                path.map((id, idx, arr) => (
                  <MuiLink
                    key={id}
                    to={`${pathPrefix}/${arr.slice(0, idx + 1).join("/")}`}
                    component={Link}
                  >
                    {id === "new" ? t("ous:breadcrumbs.new") : pathData[id]}
                  </MuiLink>
                ))}
            </Breadcrumbs>
          </FormPagePaper>
        </Grid>
        <Grid item xs>
          <GridWrapper>
            <Grid container direction={"column"} className={classes.content}>
              <Grid item>
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
              </Grid>
              <Grid item xs>
                {tab === "edit" && (
                  <Form
                    id={currentRecord ? (currentRecord.id as string) : null}
                    model={model}
                    initialRecord={parent ? { parent_id: parent } : undefined}
                    errorComponent={DefaultErrorComponent}
                    renderConditionally
                    onSubmit={(data) => {
                      const id = data.id;
                      navigate(
                        path
                          .map((part) => (part === "new" ? id : part))
                          .join("/"),
                      );
                    }}
                    customProps={{
                      goBack: () =>
                        navigate(
                          `${pathPrefix}/${path
                            .slice(0, path.length - 1)
                            .join("/")}`,
                        ),
                      open: () => throwError("open not implemented"),
                      hasCustomSubmitHandler: false,
                    }}
                  >
                    {form}
                  </Form>
                )}
                {tab === "children" && (
                  <BackendDataGrid
                    model={model}
                    onEdit={(id) => navigate(`${pathname}/${id}`)}
                    onAddNew={() => navigate(`${pathname}/new`)}
                    enableDelete
                    forceRefreshToken={current ?? "app"}
                  />
                )}
              </Grid>
            </Grid>
          </GridWrapper>
        </Grid>
      </Grid>
    </Box>
  );
};

const OrgUnits = () => {
  return useOrgUnitTree(OrgUnitForm);
};

export default React.memo(OrgUnits);
