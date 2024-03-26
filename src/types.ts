export interface IUserInfo {
  id: string;
  name: string;
  last_name: string;
}

export interface IFetchUserInfo {
  (): IUserInfo;
}

export interface IAppUsage {
  call_count: number;
  total_cputime: number;
  total_time: number;
}
