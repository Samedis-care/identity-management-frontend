import React, { useCallback } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { DescriptionOutlined } from "@mui/icons-material";
import { useCloseThisDialog } from "components-care";
import { useTranslation } from "react-i18next";
import AccountDialog from "../components/AccountDialog";
import DialogRow from "../components/DialogRow";
import type { MyApp } from "../useMyApps";

export interface DocumentPickerDialogProps {
  app: MyApp;
  /** opens the picked document */
  onPick: (name: string) => void;
}

/** lets the user pick one of several documents of an app */
const DocumentPickerDialog = (props: DocumentPickerDialogProps) => {
  const { app, onPick } = props;
  const { t } = useTranslation("account");
  const close = useCloseThisDialog();
  // the list entries carry their document in data-doc
  const pick = useCallback(
    (evt: React.MouseEvent<HTMLElement>) => {
      close();
      onPick(evt.currentTarget.dataset.doc!);
    },
    [close, onPick],
  );
  return (
    <AccountDialog
      title={t("dialogs.documents.title", { APP: app.full_name || app.name })}
    >
      <DialogRow>
        <List disablePadding>
          {app.required_documents.map((doc) => (
            <ListItemButton key={doc} data-doc={doc} onClick={pick}>
              <ListItemIcon>
                <DescriptionOutlined
                  color={
                    app.requires_acceptance.includes(doc)
                      ? "warning"
                      : "success"
                  }
                />
              </ListItemIcon>
              <ListItemText
                primary={t("apps.documents." + doc, { defaultValue: doc })}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogRow>
    </AccountDialog>
  );
};

export default React.memo(DocumentPickerDialog);
