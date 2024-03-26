import dotenv from 'dotenv';
import { IUserInfo } from './types';
import { getBackoff, sleep } from './utils';
dotenv.config();

const ACCESS_TOKEN = process.env.FB_TOKEN as string;
const FB_API_VERSION = 'v19.0';

if (!ACCESS_TOKEN?.length) {
  console.log('Access Token is missing. Exiting program.');
}

async function fetchUserInfo(): Promise<Response> {
  return await fetch(`https://graph.facebook.com/${FB_API_VERSION}/me?fields=id,name,last_name&access_token=${ACCESS_TOKEN}`);
}

(async function () {
  while (true) {
    const resp: Response = await fetchUserInfo();

    if (resp.status === 200) {
      const userInfo: IUserInfo = await resp.json();
      if (!userInfo) {
        console.log('No response. Please make sure token provided is correct');
        return;
      }
      console.log(userInfo);
    }

    const backoff: number | null = await getBackoff(resp);

    if (!backoff) {
      //backoff returned is null, exit the program
      return;
    }
    // wait
    await sleep(backoff);
  }
})();
