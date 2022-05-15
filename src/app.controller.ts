import { CACHE_MANAGER, Controller, Get, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';
import axios from 'axios';

@Controller('allocator')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('reload')
  async init(): Promise<string> {
    const token = await this.getAccessToken();
    await this.cacheManager.set('token', token, { ttl: 7200 });
    return token;
  }

  @Get()
  async main(): Promise<string> {
    const value = (await this.cacheManager.get('token')) as unknown as string;
    if (value) {
      return value;
    }

    const token = await this.getAccessToken();
    await this.cacheManager.set('token', token, { ttl: 7200 });

    return token;
  }

  async getAccessToken() {
    const appId = process.env.WX_OPEN_APP_ID;
    const appSecret = process.env.WX_OPEN_SECRET;
    const grantType = 'client_credential';

    const res = await axios({
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      params: {
        grant_type: grantType,
        appid: appId,
        secret: appSecret,
      },
    }).then(
      (r) =>
        r.data as unknown as {
          access_token: string | null;
          expires_in: number | null;
          errcode: -1 | 0 | 40001 | 40002 | 40003 | null;
          errmsg: string | null;
        },
    );

    console.error(res);
    return res.access_token;
  }
}
