import React from "react";
import { Grid2 as Grid, Typography } from "@mui/material";
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
      size={"grow"}
    >
      <Grid>
        <Grid
          container
          spacing={2}
          justifyContent={"flex-start"}
          alignContent={"stretch"}
          alignItems={"center"}
        >
          <Grid>
            <Typography variant={"h2"} component={"h1"}>
              Identity Management
            </Typography>
          </Grid>
          <Grid>
            <AppIndicator />
          </Grid>
          <Grid>
            <TenantIndicator />
          </Grid>
        </Grid>
      </Grid>
      <Grid>
        <AccountActions />
      </Grid>
    </Grid>
  );
};

export default React.memo(Header);
