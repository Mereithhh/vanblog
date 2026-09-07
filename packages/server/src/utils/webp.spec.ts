import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildCwebpArgv, compressImgToWebp, runCwebp } from './webp';

function installFakeCwebp(tmp: string, scriptBody?: string) {
  const bin = path.join(tmp, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  const recorder = path.join(tmp, 'cwebp-args.json');
  const script = path.join(bin, 'cwebp');
  const body =
    scriptBody ||
    `#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
fs.writeFileSync(${JSON.stringify(recorder)}, JSON.stringify(args));
const o = args.indexOf('-o');
if (o >= 0 && args[o + 1]) {
  fs.writeFileSync(args[o + 1], 'WEBP');
}
process.exit(0);
`;
  fs.writeFileSync(script, body);
  fs.chmodSync(script, 0o755);
  return { bin, recorder };
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
  let prevPath: string | undefined;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-cwebp-'));
    prevPath = process.env.PATH;
  });

  afterEach(() => {
    process.env.PATH = prevPath;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('spawns cwebp with an argument array and quality 80 (#482)', async () => {
    const { bin, recorder } = installFakeCwebp(tmp);
    process.env.PATH = `${bin}${path.delimiter}${prevPath || ''}`;

    const buf = await compressImgToWebp(Buffer.from('fake-image'));
    expect(buf.equals(Buffer.from('WEBP'))).toBe(true);

    const args = JSON.parse(fs.readFileSync(recorder, 'utf8')) as string[];
    expect(args).toEqual(['-q', '80', expect.stringMatching(/^\/tmp\/temp\d+$/), '-o', expect.stringMatching(/^\/tmp\/temp\d+\.webp$/)]);
    expect(args).toHaveLength(5);
  });

  it('does not interpret && or $() in paths as shell commands (#482)', () => {
    const { bin, recorder } = installFakeCwebp(tmp);
    process.env.PATH = `${bin}${path.delimiter}${prevPath || ''}`;

    const marker = path.join(tmp, 'pwned');
    const also = path.join(tmp, 'also');
    const input = path.join(tmp, `img && touch ${marker} $(touch ${also})`);
    const output = path.join(tmp, 'out.webp');
    fs.writeFileSync(input, 'src');

    runCwebp(input, output);

    const args = JSON.parse(fs.readFileSync(recorder, 'utf8')) as string[];
    expect(args).toEqual(['-q', '80', input, '-o', output]);
    expect(fs.existsSync(marker)).toBe(false);
    expect(fs.existsSync(also)).toBe(false);
    expect(fs.readFileSync(output, 'utf8')).toBe('WEBP');
  });

  it('throws when cwebp fails so callers can skip webp', () => {
    const { bin } = installFakeCwebp(
      tmp,
      `#!/usr/bin/env node
process.stderr.write('cwebp failed');
process.exit(1);
`,
    );
    process.env.PATH = `${bin}${path.delimiter}${prevPath || ''}`;
    expect(() => runCwebp(path.join(tmp, 'in'), path.join(tmp, 'out.webp'))).toThrow(/cwebp failed/);
  });
});
