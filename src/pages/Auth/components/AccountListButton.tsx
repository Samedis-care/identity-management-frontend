import React from "react";
import { Typography, Grid, styled } from "@mui/material";
import AccountAvatar from "./AccountAvatar";

export interface AddNewAccountProps {
  icon: React.ReactNode;
  text: React.ReactNode;
  onClick: React.MouseEventHandler;
}

const RootGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const LabelTypography = styled(Typography)({
  lineHeight: "36px",
});

const AccountListButton = (props: AddNewAccountProps) => {
  const { icon, text, onClick } = props;
  return (
    <RootGrid size={12} onClick={onClick} container spacing={2}>
      <Grid>
        <AccountAvatar>{icon}</AccountAvatar>
      </Grid>
      <Grid size={"grow"}>
        <LabelTypography>{text}</LabelTypography>
      </Grid>
    </RootGrid>
  );
};

export default React.memo(AccountListButton);
