import React, { useEffect } from "react";
import { Loader, useLocation, useNavigate } from "components-care";
import { ACCOUNT_BASE } from "../Account/constants";

/**
 * The profile used to exist twice, inside the portal (/profile) and standalone
 * (/my-profile). Both are the account pages now; the portal entry leads there.
 */
const ProfileRedirect = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  useEffect(() => {
    navigate({ pathname: ACCOUNT_BASE, search }, { replace: true });
  }, [navigate, search]);
  return <Loader />;
};

export default React.memo(ProfileRedirect);
