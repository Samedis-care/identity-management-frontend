import React from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useDialogContext } from "components-care";
import PolicyViewerContent from "./PolicyViewerContent";

export interface PolicyViewerProps {
  document: "tos-privacy";
}

const PolicyViewer = (props: PolicyViewerProps) => {
  const [, popDialog] = useDialogContext();

  return (
    <Dialog open={true} onClose={popDialog} maxWidth={false}>
      <DialogContent>
        <PolicyViewerContent document={props.document} />
      </DialogContent>
      <DialogActions>
        <Button onClick={popDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(PolicyViewer);
