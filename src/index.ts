import dotenv from 'dotenv';
import { IUserInfo } from './Facebook/types';
import { FacebookAPI } from './Facebook/FacebookAPI';
dotenv.config();

(async function () {
  const facebookApi = new FacebookAPI();
  while (true) {
    const userInfo: IUserInfo = await facebookApi.fetchUserInfo(['id', 'name', 'last_name']);
    console.log(userInfo);
  }
})();
