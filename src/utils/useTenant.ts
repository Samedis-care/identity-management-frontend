import { useParams } from "components-care";

const useTenant = (): string => {
  const { tenant } = useParams<"tenant">();
  if (!tenant) throw new Error("No tenant context");
  return tenant;
};

export default useTenant;
