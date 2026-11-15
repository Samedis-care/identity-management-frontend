import React from "react";
import {
  Breadcrumbs,
  Link as MuiLink,
  Typography,
  styled,
} from "@mui/material";
import { Link } from "components-care";

export interface DrillDownCrumb {
  label: React.ReactNode;
  /** link target; the last crumb (the open record) has none */
  to?: string;
}

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minHeight: 48,
  flexShrink: 0,
  padding: theme.spacing(0, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiBreadcrumbs-li": { ...theme.typography.subtitle1 },
}));

/**
 * Path of a record opened from a tab of a page, in place of that page's tab
 * bar: the record brings its own tabs, so only one tab level is visible
 */
const DrillDownBar = (props: { crumbs: DrillDownCrumb[] }) => (
  <Root>
    <Breadcrumbs>
      {props.crumbs.map((crumb, idx) =>
        crumb.to ? (
          <MuiLink key={idx} to={crumb.to} component={Link} underline="hover">
            {crumb.label}
          </MuiLink>
        ) : (
          <Typography key={idx} color={"text.primary"} variant={"subtitle1"}>
            {crumb.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  </Root>
);

export default React.memo(DrillDownBar);
