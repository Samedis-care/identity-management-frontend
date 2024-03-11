import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "react-query";
import BackendHttpClient from "../../components-care/connectors/BackendHttpClient";
import { getSession } from "../components/AuthProvider";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { ContentDataResponse } from "../../api/ident-services/Content";
import { Loader } from "components-care";
import {
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Toolbar,
  Tooltip,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { marked } from "marked";
import { useTranslation } from "react-i18next";

export interface DocumentViewerProps {
  app: string;
  name: string;
  decline: () => void;
  accept: (redirect_url: string) => void;
  queryParams: Record<string, unknown>;
  dialogMode?: boolean;
}

const useStyles = makeStyles({
  root: {
    paddingTop: 8,
  },
  contentContainer: {
    maxHeight: "calc(100vh - 64px - 16px)", // 100 vh - toolbar height - padding
    overflow: "auto",
  },
  contentContainerDialog: {
    maxHeight: "calc(100vh - 16px - 80px)", // 100 vh - padding - 80px (dialog)
    overflow: "auto",
  },
});

const DocumentViewer = (props: DocumentViewerProps) => {
  const { i18n, t } = useTranslation("document-viewer");

  const {
    app,
    name,
    accept: postAccept,
    decline,
    queryParams,
    dialogMode,
  } = props;

  const classes = useStyles();

  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0.0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const contentScroll = useCallback((evt: React.UIEvent<HTMLDivElement>) => {
    const maxScrollTop =
      evt.currentTarget.scrollHeight - evt.currentTarget.clientHeight;
    const scrollProgress =
      maxScrollTop === 0 ? 1.0 : evt.currentTarget.scrollTop / maxScrollTop;
    setScrollProgress((prev) =>
      prev > scrollProgress ? prev : scrollProgress,
    );
    setScrolledToEnd((prev) => prev || scrollProgress > 0.9);
  }, []);

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    contentScroll({
      currentTarget: scrollRef.current,
    } as React.UIEvent<HTMLDivElement>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentScroll, scrollRef.current]);

  const { data: contentData } = useQuery(
    ["content-acceptance", app, name],
    async () => {
      return (
        await BackendHttpClient.get<ContentDataResponse>(
          `/api/v1/${app}/content_acceptance/${name}`,
          null,
          getSession() ? AuthMode.On : AuthMode.Off,
        )
      ).data.attributes;
    },
  );

  const markdown = useMemo(() => {
    if (!contentData) return null;
    const lang = i18n.language.split("-")[0];
    const content =
      contentData.content_translations[lang] ??
      contentData.content_translations["en"];
    return marked(content);
  }, [contentData, i18n.language]);

  const accept = useCallback(async () => {
    if (!contentData) throw new Error("Invalid state");
    const { id } = contentData;
    const result = await BackendHttpClient.put<{
      meta: {
        redirect_url: string;
      };
    }>(`/api/v1/${app}/content_acceptance/${id}`, queryParams, {});
    postAccept(result.meta.redirect_url);
  }, [app, contentData, postAccept, queryParams]);

  if (!contentData || !markdown) return <Loader />;

  const hasToScroll = !contentData.acceptance_given && !scrolledToEnd;

  return (
    <Container className={classes.root}>
      <Grid container direction={"column"} wrap={"nowrap"}>
        <Grid item xs>
          <Paper
            onScroll={contentScroll}
            ref={scrollRef}
            className={
              dialogMode
                ? classes.contentContainerDialog
                : classes.contentContainer
            }
          >
            <Box p={2}>
              <article dangerouslySetInnerHTML={{ __html: markdown }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item>
          <LinearProgress
            variant={"determinate"}
            value={scrollProgress * 100}
          />
        </Grid>
        {getSession() && !dialogMode && (
          <Grid item>
            <Toolbar>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button onClick={decline} variant="contained" fullWidth>
                    {t("decline-agreement")}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip
                    title={t("read-to-accept") ?? ""}
                    disableFocusListener={!hasToScroll}
                    disableHoverListener={!hasToScroll}
                    disableTouchListener={!hasToScroll}
                  >
                    <span>
                      <Button
                        onClick={accept}
                        disabled={
                          contentData.acceptance_given || !scrolledToEnd
                        }
                        fullWidth
                        variant="contained"
                      >
                        {t("accept-agreement")}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Toolbar>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default React.memo(DocumentViewer);
