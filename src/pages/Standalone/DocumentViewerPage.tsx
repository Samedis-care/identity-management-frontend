import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { FrameworkHistory } from "components-care";
import DocumentViewer from "./DocumentViewer";
import { useLocation } from "react-router";

const DocumentViewerPage = () => {
  const location = useLocation();
  const params = useParams<"app" | "name">();
  const app = params.app ?? "";
  const name = params.name ?? "";

  const decline = useCallback(() => {
    FrameworkHistory.push("/my-profile");
  }, []);
  const accept = useCallback(async (redirect_url: string) => {
    window.location.href = redirect_url;
  }, []);

  return (
    <DocumentViewer
      app={app}
      name={name}
      decline={decline}
      accept={accept}
      queryParams={Object.fromEntries(new URLSearchParams(location.search))}
    />
  );
};

export default React.memo(DocumentViewerPage);
