import React, { useMemo } from "react";
import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import BackendHttpClient from "../components-care/connectors/BackendHttpClient";
import { marked } from "marked";
import { PolicyViewerProps } from "./PolicyViewer";
import { DataResponse } from "../api/ident-services/Common";
import AuthMode from "components-care/dist/backend-integration/Connector/AuthMode";
import { useTranslation } from "react-i18next";
import { Loader } from "components-care";

export interface PolicyViewerContentProps {
  document: PolicyViewerProps["document"];
}

type Policy = DataResponse<{
  attributes: {
    id: string;
    acceptance_given: boolean;
    acceptance_required: boolean;
    app: string;
    name: string;
    version: number;
    content_translations: Record<string, string>;
    created_at: string; // iso date
    updated_at: string; // iso date
  };
}>;

const getPolicyContent = (policy: Policy, lang: string) => {
  lang = lang.split("-")[0];
  const { content_translations } = policy.data.attributes;
  if (lang in content_translations) return content_translations[lang];
  if ("en" in content_translations) return content_translations["en"];
  console.warn("Policy not available in english", policy);
  return Object.values(content_translations)[0] as string | undefined; // any language
};

const PolicyViewerContent = (props: PolicyViewerContentProps) => {
  const { i18n } = useTranslation();
  const { isLoading, data, error } = useQuery({
    queryKey: [props.document],
    queryFn: () =>
      BackendHttpClient.get<Policy>(
        `/api/v1/identity-management/content_acceptance/${encodeURI(
          props.document,
        )}`,
        null,
        AuthMode.Off,
      ),
  });

  const content = useMemo(() => {
    if (!data) return null;
    const policy = getPolicyContent(data, i18n.language);
    return policy ? marked(policy) : null;
  }, [data, i18n.language]);

  return (
    <>
      {isLoading && <Loader />}
      {error && <Typography>{(error as Error).message}</Typography>}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </>
  );
};

export default React.memo(PolicyViewerContent);
