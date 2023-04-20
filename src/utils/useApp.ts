import { useParams } from "react-router-dom";

const useApp = (): string => {
  const { app } = useParams<{ app?: string }>();
  if (!app) throw new Error("No app context");
  return app;
};

export default useApp;
