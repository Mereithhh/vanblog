import fs from 'fs';
import os from 'os';
import path from 'path';
import { LogProvider } from './log.provider';
import { EventType } from './types';

function writeNdjson(file: string, events: object[]) {
  fs.writeFileSync(
    file,
    events.map((event) => JSON.stringify(event)).join('\n') + '\n',
  );
}

function createProvider(logPath: string, systemLogPath?: string) {
  const provider = Object.create(LogProvider.prototype) as LogProvider;
  provider.logPath = logPath;
  provider.systemLogPath =
    systemLogPath || path.join(path.dirname(logPath), 'vanblog-stdio.log');
  return provider;
}

describe('LogProvider.searchLog (#204)', () => {
  let tmp: string;
  let logPath: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-log-'));
    logPath = path.join(tmp, 'vanblog-event.log');
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('does not self-assign total after reading the log file', () => {
    const src = fs.readFileSync(path.join(__dirname, 'log.provider.ts'), 'utf8');
    expect(src).not.toMatch(/total\s*=\s*total\s*;/);
  });

  it('returns matching total independent of page and newest-first slices', async () => {
    const events: object[] = [];
    for (let i = 1; i <= 25; i++) {
      events.push({ event: EventType.LOGIN, id: i });
      if (i % 5 === 0) {
        events.push({ event: EventType.LOGOUT, id: `out-${i}` });
      }
    }
    writeNdjson(logPath, events);
    const provider = createProvider(logPath);

    const page1 = await provider.searchLog(1, 10, EventType.LOGIN);
    expect(page1.total).toBe(25);
    expect(page1.data.map((row) => row.id)).toEqual([
      25, 24, 23, 22, 21, 20, 19, 18, 17, 16,
    ]);

    const page2 = await provider.searchLog(2, 10, EventType.LOGIN);
    expect(page2.total).toBe(25);
    expect(page2.data.map((row) => row.id)).toEqual([
      15, 14, 13, 12, 11, 10, 9, 8, 7, 6,
    ]);

    const page3 = await provider.searchLog(3, 10, EventType.LOGIN);
    expect(page3.total).toBe(25);
    expect(page3.data.map((row) => row.id)).toEqual([5, 4, 3, 2, 1]);

    const page4 = await provider.searchLog(4, 10, EventType.LOGIN);
    expect(page4.total).toBe(25);
    expect(page4.data).toEqual([]);
  });

  it('does not count other event types in total or data', async () => {
    writeNdjson(logPath, [
      { event: EventType.LOGIN, id: 1 },
      { event: EventType.LOGOUT, id: 2 },
      { event: EventType.LOGIN, id: 3 },
      { event: EventType.RUN_PIPELINE, id: 4 },
    ]);
    const provider = createProvider(logPath);

    const result = await provider.searchLog(1, 10, EventType.LOGIN);
    expect(result.total).toBe(2);
    expect(result.data.map((row) => row.id)).toEqual([3, 1]);
  });
});
