import { useParams } from "components-care";

const useApp = (): string => {
  const { app } = useParams();
  if (!app) throw new Error("No app context");
  return app;
};

export default useApp;
