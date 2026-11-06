import React from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useCloseThisDialog } from "components-care";
import PolicyViewerContent from "./PolicyViewerContent";

export interface PolicyViewerProps {
  document: "tos-privacy";
}

const PolicyViewer = (props: PolicyViewerProps) => {
  const closeThisDialog = useCloseThisDialog();

  return (
    <Dialog open={true} onClose={closeThisDialog} maxWidth={false}>
      <DialogContent>
        <PolicyViewerContent document={props.document} />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeThisDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(PolicyViewer);
