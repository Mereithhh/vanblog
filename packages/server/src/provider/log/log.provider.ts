import { Injectable } from '@nestjs/common';
import pino from 'pino';
import fs from 'fs';
import { EventType } from './types';
import { Request } from 'express';
import { getNetIp, getPlatform } from './utils';
import lineReader from 'line-reader';
@Injectable()
export class LogProvider {
  logger = null;
  constructor() {
    const streams = [
      {
        stream: fs.createWriteStream('/var/log/vanblog-event.log', {
          flags: 'a+',
        }),
      },
      { stream: process.stdout },
    ];
    this.logger = pino({ level: 'debug' }, pino.multistream(streams));
  }
  async login(req: Request, success: boolean) {
    const logger = this.logger;
    const { address, ip } = await getNetIp(req);
    const platform = getPlatform(req.headers['user-agent']);
    logger.info({
      address,
      ip,
      platform,
      event: EventType.LOGIN,
      success,
    });
  }
  async searchLog(page: number, pageSize: number, eventType: EventType) {
    const skip = page * pageSize - pageSize;
    const all = page * pageSize;
    const readFunc = (eventType) => {
      return new Promise((resolve) => {
        const res = [];
        let total = 0;
        lineReader.eachLine(
          '/var/log/vanblog-event.log',
          (line: string, last: boolean) => {
            const data = JSON.parse(line);
            // console.log(eventType, data, last);
            if (data.event == eventType) {
              total = total + 1;
              if (res.length >= all) {
                res.shift();
              }
              res.push(data);
            }
            if (last) {
              resolve({ data: res, total });
            }
          },
        );
      });
    };
    let { data, total } = (await readFunc(eventType)) as {
      data: any[];
      total: number;
    };
    total = total;
    data = data.reverse();
    // 看一下 res 的数量够不够
    if (data.length <= skip) {
      return { data: [], total };
    } else {
      // 够
      return {
        data: data.slice(skip),
        total,
      };
    }
  }
}
