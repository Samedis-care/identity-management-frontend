import React from "react";
import { CenteredTypography } from "components-care";

const NotFound = () => {
  return (
    <CenteredTypography>
      ERROR 403: You don't have permissions for this page
    </CenteredTypography>
  );
};

export default React.memo(NotFound);
