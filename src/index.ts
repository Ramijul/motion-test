import dotenv from 'dotenv';
import { IAppUsage, IUserInfo } from './types';
dotenv.config();

const ACCESS_TOKEN = process.env.FB_TOKEN as string;
const FB_API_VERSION = 'v19.0';
const backoff = 2000; // backoff set to 2 seconds by default

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hasApiLimitReached(appUsage: IAppUsage) {
  return appUsage.call_count === 100 || appUsage.total_cputime === 100 || appUsage.total_time === 100;
}

async function fetchUserInfo() {
  const resp = await fetch(`https://graph.facebook.com/${FB_API_VERSION}/me?fields=id,name,last_name&access_token=${ACCESS_TOKEN}`);

  const appUsage: IAppUsage = JSON.parse(resp.headers.get('x-app-usage') as string);
  console.log(appUsage);

  if (resp.status !== 200) {
    const err: Record<string, any> = await resp.json();

    if (hasApiLimitReached(appUsage)) {
      console.log('Reached API limit. Next api call is schedule for one hour from now');
      await sleep(1000 * 60 * 60); // backoff by 1 hour
    } else if (err?.error?.code === 190) {
      console.error('Token has expired. Please update the access token and retry.');
      clearInterval(interval);
    } else {
      console.error(err?.error?.message);
    }
    return;
  }

  const data: IUserInfo = await resp.json();
  console.log(data);
}

let interval = setInterval(fetchUserInfo, backoff);
