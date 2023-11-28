// 本地开发

const { spawn } = require('child_process');
const path = require('path');
class Service {
  constructor(tasks) {
    this.tasks = tasks;
    this.ctx = {};
  }
  run() {
    for (let task of this.tasks) {
      this.runEach(task);
    }
  }
  runEach(task) {
    console.log('run', task);
    const { dir, name, cmd } = task;
    this.ctx[name] = spawn('yarn', [cmd], {
      env: {
        ...process.env,
      },
      cwd: path.join(path.resolve(process.cwd()), 'packages', dir),
      detached: true,
      shell: process.platform === 'win32',
    });
    this.ctx[name].on('exit', () => {
      process.stderr.write(`[${name}] 已停止`);
    });
    this.ctx[name].stdout.on('data', (data) => {
      if (data.toString().includes('[WebsiteProvider]') && data.toString().includes('null')) {
        return;
      }
      process.stdout.write(`[${name}] ${data.toString()}`);
    });
    this.ctx[name].stderr.on('data', (data) => {
      process.stderr.write(`[${name}] ${data.toString()}`);
    });
  }
  async stop() {
    for (const [k, ctx] of Object.entries(this.ctx)) {
      ctx.unref();
      process.kill(-ctx.pid, 'SIGINT');
    }
  }
}

const svc = new Service([
  {
    dir: 'admin',
    cmd: 'start',
    name: 'admin',
  },
  {
    dir: 'server',
    cmd: 'start',
    name: 'server',
  },
]);
svc.run();
process.on('SIGINT', async () => {
  await svc.stop();
  console.log('检测到关闭信号，优雅退出！');
  process.exit();
});
