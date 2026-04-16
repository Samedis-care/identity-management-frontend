import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
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
  styled,
  Toolbar,
  Tooltip,
} from "@mui/material";
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

const RootContainer = styled(Container)({
  paddingTop: 8,
});

const ContentContainer = styled(Paper)({
  overflow: "auto",
  maxHeight: "calc(100vh - 64px - 16px)", // 100 vh - toolbar height - padding
  "&.dialogMode": {
    maxHeight: "calc(100vh - 16px - 80px)", // 100 vh - padding - 80px (dialog)
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

  const { data: contentData } = useQuery({
    queryKey: ["content-acceptance", app, name],
    queryFn: async () => {
      return (
        await BackendHttpClient.get<ContentDataResponse>(
          `/api/v1/${app}/content_acceptance/${name}`,
          null,
          getSession() ? AuthMode.On : AuthMode.Off,
        )
      ).data.attributes;
    },
  });

  const markdown = useMemo(() => {
    if (!contentData) return null;
    const lang = i18n.language.split("-")[0];
    const content =
      contentData.content_translations[lang] ??
      contentData.content_translations["en"] ??
      Object.values(contentData.content_translations)[0];
    return content ? marked(content) : null;
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
    <RootContainer>
      <Grid container direction={"column"} wrap={"nowrap"}>
        <Grid size="grow">
          <ContentContainer
            onScroll={contentScroll}
            ref={scrollRef}
            className={dialogMode ? "dialogMode" : undefined}
          >
            <Box p={2}>
              <article dangerouslySetInnerHTML={{ __html: markdown }} />
            </Box>
          </ContentContainer>
        </Grid>
        <Grid>
          <LinearProgress
            variant={"determinate"}
            value={scrollProgress * 100}
          />
        </Grid>
        {getSession() && !dialogMode && (
          <Grid>
            <Toolbar>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Button onClick={decline} variant="contained" fullWidth>
                    {t("decline-agreement")}
                  </Button>
                </Grid>
                <Grid size={6}>
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
    </RootContainer>
  );
};

export default React.memo(DocumentViewer);
