import React from "react";
import { CenteredTypography } from "components-care";

const NotFound = () => {
  return (
    <CenteredTypography>
      ERROR 404: The page you're looking for is no longer here.
    </CenteredTypography>
  );
};

export default React.memo(NotFound);
