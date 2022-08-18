export const isIp = (str: string) => {
  const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
  return re.test(str);
};
