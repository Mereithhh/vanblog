const IP_REGEXP = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

export const isIP = (maybeIP: string): boolean => IP_REGEXP.test(maybeIP);
