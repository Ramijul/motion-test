export interface IUserInfo {
  id: string;
  name: string;
  last_name: string;
}

export interface IAppUsage {
  call_count: number;
  total_cputime: number;
  total_time: number;
}

export interface MetaApiErrorResponse {
  error: {
    code: number;
    message: string;
    type: string;
  };
}
