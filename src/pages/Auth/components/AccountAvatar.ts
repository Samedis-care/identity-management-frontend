import { Avatar, styled } from "@mui/material";

const AccountAvatar = styled(Avatar)(({ theme }) => ({
  "&.MuiAvatar-colorDefault": {
    color: theme.palette.background.paper,
  },
}));

export default AccountAvatar;
