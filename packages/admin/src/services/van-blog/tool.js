import moment from 'moment';

export const randomKey = () => {
  return (Math.random() * 1000000).toFixed(0);
};
const formatStr = 'YYYY-MM-DD HH:mm:ss';
export const getTime = (str) => {
  if (!str) {
    return '-';
  }
  return moment(str).format(formatStr);
};
export const formatTimes = (...args) => {
  for (const each of args) {
    try {
      return moment(each).format(formatStr);
    } catch {}
  }
  return '-';
};
