import React, { useCallback } from "react";
import { ListItemIcon, ListItemText, MenuItem, styled } from "@mui/material";
import type { IMenuItemDefinition } from "components-care/dist/standalone/Portal/Menu";
import { menuEntryId, useIsMenuEntryActive } from "./accountMenuItems";

export interface AccountMenuEntryProps {
  item: IMenuItemDefinition;
  /** id of the group the entry is in, null on the top level */
  parent: string | null;
  /** closes the dropdown the entry is in */
  onClose: () => void;
}

const Root = styled(MenuItem)(({ theme }) => ({
  minWidth: 240,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

/** entry of a dropdown of the top navigation (a group, or the phone menu) */
const AccountMenuEntry = (props: AccountMenuEntryProps) => {
  const { item, parent, onClose } = props;
  const active = useIsMenuEntryActive(menuEntryId(parent, item.title));
  const handleClick = useCallback(
    (evt: React.MouseEvent<HTMLElement>) => {
      onClose();
      item.onClick?.(evt);
    },
    [item, onClose],
  );
  const Icon = item.icon;
  return (
    <Root selected={active} onClick={handleClick}>
      {Icon && (
        <ListItemIcon>
          <Icon fontSize={"small"} />
        </ListItemIcon>
      )}
      <ListItemText primary={item.title} />
    </Root>
  );
};

export default React.memo(AccountMenuEntry);
