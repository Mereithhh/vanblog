import * as os from 'os';
import axios from 'axios';

// import publicIp from 'public-ip';

export const getLocalIps = () => {
  const res = [];
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4') {
        res.push(alias.address);
      }
    }
  }
  return res;
};
export const getPublicIp = async () => {
  try {
    // return await publicIpv4();
    const res = await axios.get('http://ip.cip.cc');
    if (res.data && res.data.trim() != '') {
      return res.data.replace('\n', '');
    } else {
      return null;
    }
  } catch (err) {
    console.log('获取公网 IP 超时');
    return null;
  }
};
export const getDefaultSubjects = async () => {
  const localIps = await getLocalIps();
  const publicIP = await getPublicIp();
  const result = localIps;
  if (!localIps.includes(publicIP) && Boolean(publicIP)) {
    result.push(publicIP);
  }
  if (!result.includes('127.0.0.1')) {
    result.push('127.0.0.1');
  }
  result.push('localhost');
  return result;
};
export const isIpv4 = (ip: string) => {
  const v4 =
    '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';
  const reg = new RegExp(`^${v4}$`);
  return reg.test(ip);
};
