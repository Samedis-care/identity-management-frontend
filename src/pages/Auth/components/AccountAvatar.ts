import { Avatar } from "@mui/material";

import withStyles from "@mui/styles/withStyles";

const AccountAvatar = withStyles((theme) => ({
  colorDefault: {
    color: theme.palette.background.paper,
  },
}))(Avatar);

export default AccountAvatar;
