import React, { useContext } from "react";
import { useLocation } from "components-care";

/** the IM app every account page talks to when ?app= is missing */
export const DEFAULT_ACCOUNT_APP = "identity-management";

/**
 * The app the account pages were opened from (?app=). The account layout reads
 * it once and provides it here, so moving between the account pages keeps the
 * app even though the menu navigation drops the query string.
 */
export const AccountAppContext = React.createContext<string | null>(null);

const useAccountApp = (): string => {
  const fromLayout = useContext(AccountAppContext);
  const { search } = useLocation();
  return (
    fromLayout ?? new URLSearchParams(search).get("app") ?? DEFAULT_ACCOUNT_APP
  );
};

export default useAccountApp;
