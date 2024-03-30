import { RequestHandler } from './RequestHandler';
import { IUserInfo } from './types';

export class FacebookAPI {
  private FB_API_VERSION = 'v19.0';
  private ACCESS_TOKEN: string;
  private requestHandler: typeof RequestHandler;

  constructor(requestHandler: typeof RequestHandler = RequestHandler) {
    this.ACCESS_TOKEN = process.env.FB_TOKEN as string;

    if (!this.ACCESS_TOKEN?.length) {
      throw new Error('Access Token is missing');
    }
    this.requestHandler = requestHandler;
  }

  /**
   * Fetch user Info
   * @param fields
   * @returns
   */
  async fetchUserInfo(fields: string[]): Promise<IUserInfo> {
    const endpoint = `https://graph.facebook.com/${this.FB_API_VERSION}/me?fields=${fields.toString()}&access_token=${this.ACCESS_TOKEN}`;
    return (await this.requestHandler.fetchData(endpoint)) as IUserInfo;
  }
}
