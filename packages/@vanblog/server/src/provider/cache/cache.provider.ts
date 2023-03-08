import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheProvider {
  data: Record<string, any> = {};
  get(key: string) {
    return this.data?.[key] || {};
  }
  set(key: string, value: any) {
    this.data[key] = value;
  }
}
