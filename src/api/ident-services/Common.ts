export type DataResponse<T> = {
  data: T;
};

export type IndexResponse<T> = {
  data: T[];
};

export interface GetReportResponse {
  meta: {
    msg: {
      url: string;
    };
  };
}
