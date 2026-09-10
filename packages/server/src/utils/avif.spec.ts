import { spawnSync } from 'child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildAvifencArgv, runAvifenc } from './avif';

const actualSpawnSync = jest.requireActual<typeof import('child_process')>('child_process').spawnSync;

jest.mock('child_process', () => {
  const actual = jest.requireActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawnSync: jest.fn(),
    execSync: jest.fn(() => {
      throw new Error('execSync must not be used for avifenc');
    }),
  };
});

const mockedSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

function installFakeAvifenc(tmp: string) {
  const bin = path.join(tmp, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  const recorder = path.join(tmp, 'avifenc-args.json');
  const script = path.join(bin, 'avifenc');
  fs.writeFileSync(
    script,
    `#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
fs.writeFileSync(${JSON.stringify(recorder)}, JSON.stringify(args));
const output = args[args.length - 1];
if (output) {
  const ftyp = Buffer.alloc(12);
  ftyp.writeUInt32BE(12, 0);
  ftyp.write('ftyp', 4);
  ftyp.write('avif', 8);
  fs.writeFileSync(output, ftyp);
}
process.exit(0);
`,
  );
  fs.chmodSync(script, 0o755);
  return { script, recorder };
}

describe('buildAvifencArgv', () => {
  it('keeps path metacharacters as a single argv element', () => {
    const input = '/tmp/img && touch /tmp/pwned $(touch /tmp/also)';
    const output = '/tmp/out.avif';
    expect(buildAvifencArgv(input, output)).toEqual(['-q', '50', input, output]);
  });
});

describe('runAvifenc', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-avifenc-'));
    const fake = installFakeAvifenc(tmp);
    mockedSpawnSync.mockReset();
    mockedSpawnSync.mockImplementation((command, args, options) => {
      if (command !== 'avifenc') {
        throw new Error(`expected argv spawn of avifenc, got ${String(command)}`);
      }
      if (!Array.isArray(args)) {
        throw new Error('avifenc must be spawned with an argument array, not a shell string');
      }
      if ((options as { shell?: boolean } | undefined)?.shell) {
        throw new Error('avifenc must not be spawned with shell: true');
      }
      return actualSpawnSync(fake.script, args, { encoding: 'buffer' });
    });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('spawns avifenc with an argument array and quality 50', () => {
    const input = path.join(tmp, 'in.png');
    const output = path.join(tmp, 'out.avif');
    fs.writeFileSync(input, 'src');
    runAvifenc(input, output);
    const [, args] = mockedSpawnSync.mock.calls[0];
    expect(args).toEqual(['-q', '50', input, output]);
    const out = fs.readFileSync(output);
    expect(out.toString('ascii', 4, 8)).toBe('ftyp');
    expect(out.toString('ascii', 8, 12)).toBe('avif');
  });

  it('throws when avifenc fails so callers can skip avif', () => {
    mockedSpawnSync.mockImplementationOnce(() => ({
      status: 1,
      error: undefined,
      stderr: Buffer.from('avifenc failed'),
      stdout: Buffer.from(''),
      pid: 1,
      output: [null, Buffer.from(''), Buffer.from('')],
      signal: null,
    }));
    expect(() => runAvifenc('/tmp/in', '/tmp/out.avif')).toThrow(/avifenc failed/);
  });
});
