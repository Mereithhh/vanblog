import axios from 'axios';

function headerValue(req: any, name: string): unknown {
  const headers = req?.headers;
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }
  const wanted = name.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(headers, wanted)) {
    return headers[wanted];
  }
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === wanted) {
      return headers[key];
    }
  }
  return undefined;
}

function splitIpList(raw: unknown): string[] {
  if (raw == null || raw === '') {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => splitIpList(item));
  }
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** Strip brackets, IPv4 :port, and IPv4-mapped IPv6 without mangling real IPv6. */
export function normalizeClientIp(raw: string): string {
  if (raw == null) {
    return '';
  }
  let ip = String(raw).trim();
  if ((ip.startsWith('"') && ip.endsWith('"')) || (ip.startsWith("'") && ip.endsWith("'"))) {
    ip = ip.slice(1, -1).trim();
  }
  const zone = ip.indexOf('%');
  if (zone !== -1) {
    ip = ip.slice(0, zone);
  }
  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'));
  }
  const mapped = ip.match(/^::ffff:((?:\d{1,3}\.){3}\d{1,3})$/i);
  if (mapped) {
    return mapped[1];
  }
  const v4port = ip.match(/^((?:\d{1,3}\.){3}\d{1,3}):\d+$/);
  if (v4port) {
    return v4port[1];
  }
  return ip;
}

/** Same IPv4 skip rules as the old getNetIp loop, plus loopback / ULA IPv6. */
export function isSkippedPrivateIp(ip: string): boolean {
  const n = normalizeClientIp(ip);
  if (!n) {
    return true;
  }
  const lower = n.toLowerCase();
  if (n.includes(':')) {
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') {
      return true;
    }
    if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80:')) {
      return true;
    }
    return false;
  }
  const ipNumArray = n.split('.');
  const tmp = ipNumArray[0] + '.' + ipNumArray[1];
  return (
    tmp === '192.168' ||
    (ipNumArray[0] === '172' && Number(ipNumArray[1]) >= 16 && Number(ipNumArray[1]) <= 32) ||
    tmp === '10.7' ||
    tmp === '127.0'
  );
}

function shouldWipeLoggedIp(ip: string): boolean {
  return ip.includes('127.0') || ip.includes('192.168') || ip.includes('10.7');
}

function firstPublicIp(candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const ip = normalizeClientIp(candidate);
    if (!ip) {
      continue;
    }
    if (isSkippedPrivateIp(ip)) {
      continue;
    }
    return ip;
  }
  return undefined;
}

/**
 * Visitor IP for login / audit logs.
 * Prefer Cloudflare's CF-Connecting-IP (and True-Client-IP) over edge/VPS
 * addresses that show up in X-Real-IP / X-Forwarded-For / req.ip.
 */
export function pickClientIp(req: any): string {
  const fromCdn = firstPublicIp([
    ...splitIpList(headerValue(req, 'cf-connecting-ip')),
    ...splitIpList(headerValue(req, 'true-client-ip')),
  ]);
  if (fromCdn) {
    return fromCdn;
  }

  const ipArray = [
    ...new Set(
      [
        ...splitIpList(headerValue(req, 'x-real-ip')),
        ...splitIpList(headerValue(req, 'x-forwarded-for')),
        ...splitIpList(req?.ip),
        ...(Array.isArray(req?.ips) ? req.ips : []),
        req?.socket?.remoteAddress,
        req?.connection?.remoteAddress,
      ]
        .map((value) => (value == null ? '' : String(value)))
        .map(normalizeClientIp)
        .filter(Boolean),
    ),
  ];

  let ip = ipArray[0] || '';
  if (ipArray.length > 1) {
    for (let i = 0; i < ipArray.length; i++) {
      if (isSkippedPrivateIp(ipArray[i])) {
        continue;
      }
      ip = ipArray[i];
      break;
    }
  }

  if (!ip || shouldWipeLoggedIp(ip) || (ip.includes(':') && isSkippedPrivateIp(ip))) {
    return '';
  }
  return ip;
}

export async function getNetIp(req: any) {
  const ip = pickClientIp(req);
  try {
    const { data } = await axios.get(`https://cip.cc/${ip}`);
    // const ipApi = got.got
    //   .get(`https://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`)
    //   .buffer();

    const ipRegx = /.*IP	:(.*)\n/;
    const addrRegx = /.*数据二	:(.*)\n/;
    if (data && ipRegx.test(data) && addrRegx.test(data)) {
      const parsedIp = data.match(ipRegx)[1];
      const addr = data.match(addrRegx)[1];
      return { address: addr, ip: parsedIp };
    } else {
      return { address: `获取失败`, ip };
    }
  } catch (error) {
    return { address: `获取失败`, ip };
  }
}

export function getPlatform(userAgent: string): 'mobile' | 'desktop' {
  const ua = userAgent.toLowerCase();
  const testUa = (regexp: RegExp) => regexp.test(ua);
  const testVs = (regexp: RegExp) =>
    (ua.match(regexp) || [])
      .toString()
      .replace(/[^0-9|_.]/g, '')
      .replace(/_/g, '.');

  // 系统
  let system = 'unknow';
  if (testUa(/windows|win32|win64|wow32|wow64/g)) {
    system = 'windows'; // windows系统
  } else if (testUa(/macintosh|macintel/g)) {
    system = 'macos'; // macos系统
  } else if (testUa(/x11/g)) {
    system = 'linux'; // linux系统
  } else if (testUa(/android|adr/g)) {
    system = 'android'; // android系统
  } else if (testUa(/ios|iphone|ipad|ipod|iwatch/g)) {
    system = 'ios'; // ios系统
  }

  let platform = 'desktop';
  if (system === 'windows' || system === 'macos' || system === 'linux') {
    platform = 'desktop';
  } else if (system === 'android' || system === 'ios' || testUa(/mobile/g)) {
    platform = 'mobile';
  }

  return platform as 'mobile' | 'desktop';
}
