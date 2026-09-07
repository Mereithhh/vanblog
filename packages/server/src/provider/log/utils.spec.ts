import axios from 'axios';
import { getNetIp, isSkippedPrivateIp, pickClientIp } from './utils';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const CLIENT_IP = '203.0.113.10';
const EDGE_IP = '104.16.1.2';
const VPS_IP = '198.51.100.20';

function mockReq(
  opts: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    ips?: string[];
    remoteAddress?: string;
  } = {},
) {
  return {
    headers: opts.headers || {},
    ip: opts.ip,
    ips: opts.ips || [],
    socket: { remoteAddress: opts.remoteAddress },
  };
}

function cipCcBody(ip: string, addr = '测试地址') {
  return `IP	:${ip}\n数据二	:${addr}\n`;
}

describe('pickClientIp / getNetIp (#127)', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.get.mockImplementation(async (url: string) => {
      const ip = String(url).replace('https://cip.cc/', '');
      return { data: cipCcBody(ip) };
    });
  });

  it('prefers CF-Connecting-IP over a misleading X-Forwarded-For / req.ip edge address', async () => {
    const req = mockReq({
      headers: {
        'CF-Connecting-IP': CLIENT_IP,
        'x-forwarded-for': `${EDGE_IP}, ${VPS_IP}`,
        'x-real-ip': EDGE_IP,
      },
      ip: EDGE_IP,
      remoteAddress: VPS_IP,
    });

    expect(pickClientIp(req)).toBe(CLIENT_IP);

    const result = await getNetIp(req);
    expect(result.ip).toBe(CLIENT_IP);
    expect(result.address).toBe('测试地址');
    expect(mockedAxios.get).toHaveBeenCalledWith(`https://cip.cc/${CLIENT_IP}`);
  });

  it('reads cf-connecting-ip regardless of header casing and surrounding whitespace', () => {
    expect(
      pickClientIp(
        mockReq({
          headers: { 'Cf-Connecting-Ip': `  ${CLIENT_IP}  ` },
          ip: EDGE_IP,
        }),
      ),
    ).toBe(CLIENT_IP);
  });

  it('falls back to True-Client-IP when CF-Connecting-IP is absent', () => {
    expect(
      pickClientIp(
        mockReq({
          headers: {
            'true-client-ip': CLIENT_IP,
            'x-forwarded-for': EDGE_IP,
          },
          ip: VPS_IP,
        }),
      ),
    ).toBe(CLIENT_IP);
  });

  it('still prefers CF-Connecting-IP over True-Client-IP', () => {
    expect(
      pickClientIp(
        mockReq({
          headers: {
            'cf-connecting-ip': CLIENT_IP,
            'true-client-ip': '198.51.100.99',
            'x-real-ip': EDGE_IP,
          },
        }),
      ),
    ).toBe(CLIENT_IP);
  });

  it('without a CF header, keeps prior X-Real-IP then X-Forwarded-For then req.ip behavior', () => {
    expect(
      pickClientIp(
        mockReq({
          headers: {
            'x-real-ip': '8.8.8.8',
            'x-forwarded-for': CLIENT_IP,
          },
          ip: EDGE_IP,
        }),
      ),
    ).toBe('8.8.8.8');

    expect(
      pickClientIp(
        mockReq({
          headers: { 'x-forwarded-for': CLIENT_IP },
          ip: EDGE_IP,
          remoteAddress: VPS_IP,
        }),
      ),
    ).toBe(CLIENT_IP);

    expect(
      pickClientIp(
        mockReq({
          ip: CLIENT_IP,
          remoteAddress: EDGE_IP,
        }),
      ),
    ).toBe(CLIENT_IP);

    expect(
      pickClientIp(
        mockReq({
          remoteAddress: CLIENT_IP,
        }),
      ),
    ).toBe(CLIENT_IP);
  });

  it('skips private / loopback addresses and can end up empty', () => {
    expect(
      pickClientIp(
        mockReq({
          headers: { 'x-real-ip': '192.168.1.20', 'x-forwarded-for': CLIENT_IP },
        }),
      ),
    ).toBe(CLIENT_IP);

    expect(
      pickClientIp(
        mockReq({
          headers: { 'x-real-ip': '10.7.0.1', 'x-forwarded-for': CLIENT_IP },
        }),
      ),
    ).toBe(CLIENT_IP);

    expect(
      pickClientIp(
        mockReq({
          headers: { 'x-real-ip': '127.0.0.1', 'x-forwarded-for': '172.16.0.2' },
          ip: CLIENT_IP,
        }),
      ),
    ).toBe(CLIENT_IP);

    expect(pickClientIp(mockReq({ ip: '127.0.0.1', remoteAddress: '127.0.0.1' }))).toBe('');
    expect(pickClientIp(mockReq({ ip: '192.168.0.2' }))).toBe('');
    expect(pickClientIp(mockReq({ ip: '10.7.1.1' }))).toBe('');
    expect(pickClientIp(mockReq({ ip: '::1' }))).toBe('');
  });

  it('does not treat a private CF-Connecting-IP as the visitor when a public fallback exists', () => {
    expect(
      pickClientIp(
        mockReq({
          headers: {
            'cf-connecting-ip': '192.168.0.50',
            'x-forwarded-for': CLIENT_IP,
          },
          ip: EDGE_IP,
        }),
      ),
    ).toBe(CLIENT_IP);
  });

  it('keeps a real IPv6 client address instead of slicing after the last colon', () => {
    const v6 = '2001:db8:85a3::8a2e:370:7334';
    expect(
      pickClientIp(
        mockReq({
          headers: { 'CF-Connecting-IP': v6 },
          ip: EDGE_IP,
        }),
      ),
    ).toBe(v6);
  });

  it('unwraps IPv4-mapped IPv6 from the socket when no CDN header is present', () => {
    expect(
      pickClientIp(
        mockReq({
          remoteAddress: `::ffff:${CLIENT_IP}`,
        }),
      ),
    ).toBe(CLIENT_IP);
  });

  it('returns the picked IP when cip.cc is unreachable (offline / mocked failure)', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network down'));
    const result = await getNetIp(
      mockReq({
        headers: {
          'cf-connecting-ip': CLIENT_IP,
          'x-forwarded-for': EDGE_IP,
        },
        ip: VPS_IP,
      }),
    );
    expect(result).toEqual({ address: '获取失败', ip: CLIENT_IP });
    expect(mockedAxios.get).toHaveBeenCalledWith(`https://cip.cc/${CLIENT_IP}`);
  });

  it('never hits a real cip.cc host from these tests', async () => {
    mockedAxios.get.mockResolvedValue({ data: 'not-a-match' });
    await getNetIp(mockReq({ headers: { 'cf-connecting-ip': CLIENT_IP } }));
    for (const call of mockedAxios.get.mock.calls) {
      expect(String(call[0])).toMatch(/^https:\/\/cip\.cc\//);
    }
    expect(mockedAxios.get).toHaveBeenCalled();
  });
});

describe('isSkippedPrivateIp', () => {
  it('matches the historical IPv4 skip prefixes', () => {
    expect(isSkippedPrivateIp('192.168.1.1')).toBe(true);
    expect(isSkippedPrivateIp('10.7.0.1')).toBe(true);
    expect(isSkippedPrivateIp('127.0.0.1')).toBe(true);
    expect(isSkippedPrivateIp('172.16.0.1')).toBe(true);
    expect(isSkippedPrivateIp('172.32.0.1')).toBe(true);
    expect(isSkippedPrivateIp('10.0.0.1')).toBe(false);
    expect(isSkippedPrivateIp(CLIENT_IP)).toBe(false);
    expect(isSkippedPrivateIp(EDGE_IP)).toBe(false);
  });
});
