import { useParams } from "react-router-dom";

const useTenant = (): string => {
  const { tenant } = useParams<{ tenant?: string }>();
  if (!tenant) throw new Error("No tenant context");
  return tenant;
};

export default useTenant;
