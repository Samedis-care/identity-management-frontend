import { useLocation } from "components-care";
import { ACCOUNT_BASE } from "./constants";

/** true on the admin pages: everything outside the account pages */
const useIsAdminPage = () => {
  const { pathname } = useLocation();
  return pathname !== "/" && !pathname.startsWith(ACCOUNT_BASE);
};

export default useIsAdminPage;
