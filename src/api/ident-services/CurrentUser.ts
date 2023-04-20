import { DataResponse } from "./Common";
import { User } from "./models/User";

export type GetCurrentUserResponse = DataResponse<{
  attributes: User;
}>;
