import { DataResponse } from "./Common";
import { Content } from "./models/Content";

export type ContentDataResponse = DataResponse<{
  id: string;
  type: "content";
  attributes: Content;
}>;
