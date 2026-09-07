import { spawnSync, execSync } from 'child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildCwebpArgv, compressImgToWebp, runCwebp } from './webp';

const actualSpawnSync = jest.requireActual<typeof import('child_process')>('child_process').spawnSync;

jest.mock('child_process', () => {
  const actual = jest.requireActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawnSync: jest.fn(),
    execSync: jest.fn(() => {
      throw new Error('execSync must not be used for cwebp');
    }),
  };
});

const mockedSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

function installFakeCwebp(tmp: string) {
  const bin = path.join(tmp, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  const recorder = path.join(tmp, 'cwebp-args.json');
  const script = path.join(bin, 'cwebp');
  fs.writeFileSync(
    script,
    `#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
fs.writeFileSync(${JSON.stringify(recorder)}, JSON.stringify(args));
const o = args.indexOf('-o');
if (o >= 0 && args[o + 1]) {
  fs.writeFileSync(args[o + 1], 'WEBP');
}
process.exit(0);
`,
  );
  fs.chmodSync(script, 0o755);
  return { script, recorder };
}

function fakeSpawnOk() {
  return {
    status: 0,
    error: undefined,
    stderr: Buffer.from(''),
    stdout: Buffer.from(''),
    pid: 1,
    output: [null, Buffer.from(''), Buffer.from('')],
    signal: null,
  } as ReturnType<typeof spawnSync>;
}

describe('buildCwebpArgv', () => {
  it('keeps path metacharacters as a single argv element', () => {
    const input = '/tmp/img && touch /tmp/pwned $(touch /tmp/also)';
    const output = '/tmp/out.webp';
    expect(buildCwebpArgv(input, output)).toEqual(['-q', '80', input, '-o', output]);
  });
});

describe('runCwebp / compressImgToWebp', () => {
  let tmp: string;
  let recorder: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-cwebp-'));
    const fake = installFakeCwebp(tmp);
    recorder = fake.recorder;
    mockedSpawnSync.mockReset();
    mockedExecSync.mockClear();
    mockedSpawnSync.mockImplementation((command, args, options) => {
      if (command !== 'cwebp') {
        throw new Error(`expected argv spawn of cwebp, got ${String(command)}`);
      }
      if (!Array.isArray(args)) {
        throw new Error('cwebp must be spawned with an argument array, not a shell string');
      }
      if ((options as { shell?: boolean } | undefined)?.shell) {
        throw new Error('cwebp must not be spawned with shell: true');
      }
      return actualSpawnSync(fake.script, args, { encoding: 'buffer' });
    });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('spawns cwebp with an argument array and quality 80 (#482)', async () => {
    const buf = await compressImgToWebp(Buffer.from('fake-image'));
    expect(buf.equals(Buffer.from('WEBP'))).toBe(true);
    expect(mockedExecSync).not.toHaveBeenCalled();
    expect(mockedSpawnSync).toHaveBeenCalledTimes(1);
    const [command, args, options] = mockedSpawnSync.mock.calls[0];
    expect(command).toBe('cwebp');
    expect(args).toEqual([
      '-q',
      '80',
      expect.stringMatching(/^\/tmp\/temp\d+$/),
      '-o',
      expect.stringMatching(/^\/tmp\/temp\d+\.webp$/),
    ]);
    expect((options as { shell?: boolean } | undefined)?.shell).toBeFalsy();
    expect(JSON.parse(fs.readFileSync(recorder, 'utf8'))).toEqual(args);
  });

  it('does not interpret && or $() in paths as shell commands (#482)', () => {
    const marker = path.join(tmp, 'pwned');
    const also = path.join(tmp, 'also');
    const input = path.join(tmp, 'img && touch pwned $(touch also)');
    const output = path.join(tmp, 'out.webp');
    fs.writeFileSync(input, 'src');

    runCwebp(input, output);

    expect(mockedExecSync).not.toHaveBeenCalled();
    const [, args] = mockedSpawnSync.mock.calls[0];
    expect(args).toEqual(['-q', '80', input, '-o', output]);
    expect(fs.existsSync(marker)).toBe(false);
    expect(fs.existsSync(also)).toBe(false);
    expect(fs.readFileSync(output, 'utf8')).toBe('WEBP');
    expect(JSON.parse(fs.readFileSync(recorder, 'utf8'))).toEqual(['-q', '80', input, '-o', output]);
  });

  it('throws when cwebp fails so callers can skip webp', () => {
    mockedSpawnSync.mockImplementationOnce(() => ({
      ...fakeSpawnOk(),
      status: 1,
      stderr: Buffer.from('cwebp failed'),
    }));
    expect(() => runCwebp('/tmp/in', '/tmp/out.webp')).toThrow(/cwebp failed/);
  });
});
