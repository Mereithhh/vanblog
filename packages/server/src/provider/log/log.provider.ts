import { Injectable } from '@nestjs/common';
import pino from 'pino';
import fs from 'fs';
import { EventType } from './types';
import { Request } from 'express';
import { getNetIp, getPlatform } from './utils';
import lineReader from 'line-reader';
import { config } from 'src/config';
import path from 'path';
import { checkOrCreate } from 'src/utils/checkFolder';
import { Pipeline } from 'src/scheme/pipeline.schema';
import { CodeResult } from '../pipeline/pipeline.provider';
@Injectable()
export class LogProvider {
  logger = null;
  logPath = path.join(config.log, 'vanblog-event.log');
  systemLogPath = path.join('/var/log/', 'vanblog-stdio.log');
  constructor() {
    checkOrCreate(config.log);
    const streams = [
      {
        stream: fs.createWriteStream(this.logPath, {
          flags: 'a+',
        }),
      },
      { stream: process.stdout },
    ];
    this.logger = pino({ level: 'debug' }, pino.multistream(streams));
    this.logger.info({ event: 'start' });
  }
  async runPipeline(
    pipeline: Pipeline,
    input: any,
    result?: CodeResult,
    error?: Error,
  ) {
    this.logger.info({
      event: EventType.RUN_PIPELINE,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      eventName: pipeline.eventName,
      success: result?.status == 'success' ? true : false,
      logs: result?.logs || [],
      output: result?.output || [],
      serverError: error?.message || '',
      input,
    });
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
          eventType == EventType.SYSTEM ? this.systemLogPath : this.logPath,
          (line: string, last: boolean) => {
            let data: any = line;
            if (eventType !== EventType.SYSTEM) {
              data = JSON.parse(line);
            }
            if (eventType === EventType.SYSTEM || data.event == eventType) {
              total = total + 1;
              if (res.length >= all) {
                res.shift();
              }
              res.push(data);
            }
            if (!line || line.trim() == '' || line == '\n') {
              resolve({ data: res, total });
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
