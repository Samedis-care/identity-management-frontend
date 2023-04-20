import React from "react";
import { Grid, Typography } from "@mui/material";
import AccountActions from "./AccountActions";
import AppIndicator from "./AppIndicator";
import TenantIndicator from "./TenantIndicator";

const Header = () => {
  return (
    <Grid
      container
      spacing={2}
      justifyContent={"space-between"}
      alignItems={"center"}
      alignContent={"stretch"}
    >
      <Grid item>
        <Grid
          container
          spacing={2}
          justifyContent={"flex-start"}
          alignContent={"stretch"}
          alignItems={"center"}
        >
          <Grid item>
            <Typography variant={"h2"} component={"h1"}>
              Identity Management
            </Typography>
          </Grid>
          <Grid item>
            <AppIndicator />
          </Grid>
          <Grid item>
            <TenantIndicator />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <AccountActions />
      </Grid>
    </Grid>
  );
};

export default React.memo(Header);
