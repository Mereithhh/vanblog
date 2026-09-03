import {
  buildWalineClientOptionsFromOtherConfig,
  buildWalineEnvFromOtherConfig,
  coerceWalineOptionValue,
  getWalinePublicCommentSetting,
  parseWalineOtherConfig,
  stringifyWalineEnvValue,
  stripJsonCommentsAndTrailingCommas,
  tryParseWalineOtherConfig,
} from './walineExtra';

const ISSUE_139_JSON = `{
    "imageUploader" : "false" , // 禁用图片上传
    "IPQPS" : 60  // 同一ip限制60秒发言
}`;

describe('walineExtra', () => {
  it('parses extra options from admin JSON onto server env and client config', () => {
    const raw = JSON.stringify({ imageUploader: false, IPQPS: 60 });
    const env = buildWalineEnvFromOtherConfig(raw);
    const client = buildWalineClientOptionsFromOtherConfig(raw);

    expect(env.IPQPS).toBe('60');
    expect(env.imageUploader).toBe('false');
    expect(client.imageUploader).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(client, 'imageUploader')).toBe(true);
  });

  it('does not drop imageUploader false', () => {
    const client = buildWalineClientOptionsFromOtherConfig(
      JSON.stringify({ imageUploader: false }),
    );
    expect(client).toEqual({ imageUploader: false });
  });

  it('coerces string "false" / "true" and numeric strings', () => {
    expect(coerceWalineOptionValue('false')).toBe(false);
    expect(coerceWalineOptionValue('true')).toBe(true);
    expect(coerceWalineOptionValue('60')).toBe(60);
    expect(coerceWalineOptionValue(false)).toBe(false);
    expect(coerceWalineOptionValue(60)).toBe(60);
  });

  it('treats the issue #139 JSON (comments + string false + numeric IPQPS) as applying', () => {
    const parsed = parseWalineOtherConfig(ISSUE_139_JSON);
    expect(parsed.imageUploader).toBe(false);
    expect(parsed.IPQPS).toBe(60);

    const env = buildWalineEnvFromOtherConfig(ISSUE_139_JSON);
    expect(env.IPQPS).toBe('60');
    expect(env.imageUploader).toBe('false');

    const client = buildWalineClientOptionsFromOtherConfig(ISSUE_139_JSON);
    expect(client.imageUploader).toBe(false);
  });

  it('keeps imageUploader false after stringify so spawn env does not drop it', () => {
    expect(stringifyWalineEnvValue(false)).toBe('false');
    expect(stringifyWalineEnvValue(60)).toBe('60');
    expect(stringifyWalineEnvValue(undefined)).toBeUndefined();
  });

  it('does not put server-only keys on the public comment setting', () => {
    const publicSetting = getWalinePublicCommentSetting({
      forceLoginComment: true,
      otherConfig: JSON.stringify({
        imageUploader: false,
        IPQPS: 60,
        AKISMET_KEY: 'secret',
        LOGIN: 'enable',
      }),
    });
    expect(publicSetting.forceLoginComment).toBe(true);
    expect(publicSetting.imageUploader).toBe(false);
    expect(publicSetting).not.toHaveProperty('IPQPS');
    expect(publicSetting).not.toHaveProperty('AKISMET_KEY');
    expect(publicSetting).not.toHaveProperty('LOGIN');
  });

  it('returns empty client options when otherConfig is missing', () => {
    expect(buildWalineClientOptionsFromOtherConfig(undefined)).toEqual({});
    expect(getWalinePublicCommentSetting(null)).toEqual({ forceLoginComment: false });
  });

  it('swallows invalid JSON instead of throwing when applying config', () => {
    expect(tryParseWalineOtherConfig('{ not json')).toEqual({});
    expect(buildWalineEnvFromOtherConfig('{ not json')).toEqual({});
  });

  it('strips comments and trailing commas without touching // inside strings', () => {
    const stripped = stripJsonCommentsAndTrailingCommas(
      `{ "url": "https://example.com/path", "ok": true, } // note`,
    );
    expect(JSON.parse(stripped)).toEqual({ url: 'https://example.com/path', ok: true });
  });
});
