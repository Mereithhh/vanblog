import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PipelineDocument } from 'src/scheme/pipeline.schema';
import { VanblogSystemEvent, VanblogSystemEventNames } from 'src/types/event';
import { CreatePipelineDto, UpdatePipelineDto } from 'src/types/pipeline.dto';
import { sleep } from 'src/utils/sleep';
import { spawnSync } from 'child_process';
import { config } from 'src/config/index';
import { writeFileSync, rmSync } from 'fs';
import { fork } from 'child_process';
import { LogProvider } from '../log/log.provider';

export interface CodeResult {
  logs: string[];
  output: any;
  status: 'success' | 'error';
}

@Injectable()
export class PipelineProvider {
  logger = new Logger(PipelineProvider.name);
  idLock = false;
  runnerPath = config.codeRunnerPath;
  constructor(
    @InjectModel('Pipeline')
    private pipelineModel: Model<PipelineDocument>,
    private readonly logProvider: LogProvider,
  ) {
    this.init();
  }

  checkEvent(eventName: string) {
    if (VanblogSystemEventNames.includes(eventName)) {
      return true;
    }
    return false;
  }

  async checkAllDeps() {
    this.logger.log('初始化流水线代码库，这可能需要一段时间');
    const pipelines = await this.getAll();
    const deps = [];
    for (const pipeline of pipelines) {
      for (const dep of pipeline.deps) {
        if (!deps.includes(dep)) {
          deps.push(dep);
        }
      }
    }
    await this.addDeps(deps);
  }

  async saveAllScripts() {
    const pipelines = await this.getAll();
    for (const pipeline of pipelines) {
      await this.saveOrUpdateScriptToRunnerPath(pipeline.id, pipeline.script);
    }
  }

  async init() {
    // 检查一遍，安装依赖
    this.checkAllDeps();
    await this.saveAllScripts();
  }

  async getNewId() {
    while (this.idLock) {
      await sleep(10);
    }
    this.idLock = true;
    const maxObj = await this.pipelineModel.find({}).sort({ id: -1 }).limit(1);
    let res = 1;
    if (maxObj.length) {
      res = maxObj[0].id + 1;
    }
    this.idLock = false;
    return res;
  }

  async createPipeline(pipeline: CreatePipelineDto) {
    if (!this.checkEvent(pipeline.eventName)) {
      throw new NotFoundException('Event not found in VanblogEventNames');
    }
    const id = await this.getNewId();
    let script = pipeline.script;
    if (!script || !script.trim()) {
      script = `
// 异步任务，请在脚本顶层使用 await，不然会直接被忽略
// 请使用 input 变量获取数据（如果有）
// 直接修改 input 里的内容即可
// 脚本结束后 input 将被返回

`;
    }
    const newPipeline = await this.pipelineModel.create({
      id,
      ...pipeline,
      script,
    });
    await newPipeline.save();
    await this.saveOrUpdateScriptToRunnerPath(id, newPipeline.script);
    await this.addDeps(newPipeline.deps);
  }

  async updatePipelineById(id: number, updateDto: UpdatePipelineDto) {
    await this.pipelineModel.updateOne({ id: id }, updateDto);
    if (updateDto.script) {
      await this.saveOrUpdateScriptToRunnerPath(id, updateDto.script);
    }
    if (updateDto.deps) {
      await this.addDeps(updateDto.deps);
    }
  }

  async deletePipelineById(id: number) {
    await this.pipelineModel.updateOne(
      { id: id },
      {
        deleted: true,
      },
    );
    await this.deleteScriptById(id);
  }
  async getAll() {
    return await this.pipelineModel.find({
      deleted: false,
    });
  }

  async getPipelineById(id: number) {
    return await this.pipelineModel.findOne({ id: id });
  }

  async getPipelinesByEvent(eventName: string) {
    return await this.pipelineModel.find({
      eventName,
      deleted: false,
    });
  }

  async triggerById(id: number, data: any) {
    const result = await this.runCodeByPipelineId(id, data);
    return result;
  }

  async dispatchEvent(eventName: VanblogSystemEvent, data?: any) {
    const pipelines = await this.getPipelinesByEvent(eventName);
    const results: CodeResult[] = [];
    for (const pipeline of pipelines) {
      if (pipeline.enabled) {
        try {
          const result = await this.runCodeByPipelineId(pipeline.id, data);
          results.push(result);
        } catch (e) {
          this.logger.error(e);
        }
      }
    }
    return results;
  }

  getPathById(id: number) {
    return `${this.runnerPath}/${id}.js`;
  }

  async runCodeByPipelineId(id: number, data: any): Promise<CodeResult> {
    const pipeline = await this.getPipelineById(id);
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }
    const traceId = new Date().getTime();
    this.logger.log(`[${traceId}]开始运行流水线: ${id} ${JSON.stringify(data, null, 2)}`);
    const run = new Promise((resolve, reject) => {
      const subProcess = fork(this.getPathById(id));
      subProcess.send(data || {});
      subProcess.on('message', (msg: CodeResult) => {
        if (msg.status === 'error') {
          subProcess.kill('SIGINT');
          reject(msg);
        } else {
          resolve(msg);
        }
      });
    });
    try {
      const result = (await run) as CodeResult;
      this.logger.log(`[${traceId}]运行流水线成功: ${id} ${JSON.stringify(result, null, 2)}`);
      this.logProvider.runPipeline(pipeline, data, result);
      return result;
    } catch (err) {
      this.logger.error(`[${traceId}]运行流水线失败: ${id} ${JSON.stringify(err, null, 2)}`);
      this.logProvider.runPipeline(pipeline, data, undefined, err);
      throw err;
    }
  }

  async addDeps(deps: string[]) {
    for (const dep of deps) {
      try {
        const r = spawnSync(`pnpm`, ['add', dep], {
          cwd: this.runnerPath,
          shell: process.platform === 'win32',
          env: {
            ...process.env,
          },
        });
        console.log(r.output.toString());
      } catch (e) {
        // console.log(e.output.map(a => a.toString()).join(''));
        console.log(e);
        // this.logger.error(e);
      }
    }
  }

  async deleteScriptById(id: number) {
    const filePath = this.getPathById(id);
    try {
      rmSync(filePath);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async saveOrUpdateScriptToRunnerPath(id: number, script: string) {
    const filePath = this.getPathById(id);
    const scriptToSave = `
      let input = {};
      let logs = [];
      const oldLog = console.log;
      console.log = (...args) => {
        const logArr = [];
        for (const each of args) {
          if (typeof each === 'object') {
            logArr.push(JSON.stringify(each,null,2));
          } else {
            logArr.push(each);
          }
        }
        logs.push(logArr.join(" "));
        oldLog(...args);
      };
      process.on('message',async (msg) => {
        input = msg;
        try {
          ${script}
          process.send({
            status: 'success',
            output: input,
            logs,
          });
        } catch(err) {
          process.send({
            status: 'error',
            output: err,
            logs,
          });
        }
      });
    `;
    writeFileSync(filePath, scriptToSave, { encoding: 'utf-8' });
  }
}
