import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Post,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';
import axios from 'axios';
import { MainDTO } from './dto/main.dto';
import * as crypto from 'crypto';

@Controller('allocator')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 主动刷新
  @Post('reload')
  async init(@Body() body: MainDTO): Promise<string> {
    const appId = body.appId;
    const secret = body.secret;
    const hash = this.sha1(`${appId}${secret}`);

    const token = await this.getAccessToken(appId, secret);
    await this.cacheManager.set(hash, token, { ttl: 7200 });

    return token;
  }

  sha1(payload: string) {
    return crypto.createHash('sha1').update(payload).digest('hex');
  }

  @Post()
  async main(@Body() body: MainDTO): Promise<string> {
    const appId = body.appId;
    const secret = body.secret;
    const hash = this.sha1(`${appId}${secret}`);

    const value = await this.cacheManager.get(hash);
    if (value) {
      return value as unknown as string;
    }

    const token = await this.getAccessToken(appId, secret);
    await this.cacheManager.set(hash, token, { ttl: 7200 });

    return token;
  }

  async getAccessToken(appId: string, secret: string) {
    const grantType = 'client_credential';

    const res = await axios({
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      params: {
        grant_type: grantType,
        appid: appId,
        secret,
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
