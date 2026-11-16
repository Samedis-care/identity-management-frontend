import React, { useContext, useEffect } from "react";

/** setter for the heading of the admin page frame, null = menu title */
export const AdminTitleContext = React.createContext<
  ((title: string | null) => void) | null
>(null);

/**
 * Replaces the heading of the admin page (the menu title) while mounted,
 * e.g. by the name of the record the page shows
 */
export const useAdminTitle = (title: string | null | undefined) => {
  const setTitle = useContext(AdminTitleContext);
  useEffect(() => {
    if (!setTitle) return;
    setTitle(title ?? null);
    return () => setTitle(null);
  }, [setTitle, title]);
};
