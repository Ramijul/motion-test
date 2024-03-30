import dotenv from 'dotenv';
import { IUserInfo } from './Facebook/types';
import { FacebookAPI } from './Facebook/FacebookAPI';
import { RateLimitError } from './Facebook/RateLimitError';
dotenv.config();

(async function () {
  const facebookApi = new FacebookAPI();

  while (true) {
    try {
      const userInfo: IUserInfo = await facebookApi.fetchUserInfo(['id', 'name', 'last_name']);
      console.log(userInfo);
    } catch (e) {
      if (e instanceof RateLimitError) {
        console.error(e.message);
      } else {
        console.error(e);
        break;
      }
    }
  }
})();
