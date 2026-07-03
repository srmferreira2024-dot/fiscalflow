import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(configService: ConfigService<AppConfig, true>) {
    this.client = new Redis({
      host: configService.get('redis.host', { infer: true }),
      port: configService.get('redis.port', { infer: true }),
    });
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
