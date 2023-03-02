const IP_REGEXP = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

export const isIp = (maybeIP: string): boolean => IP_REGEXP.test(maybeIP);
