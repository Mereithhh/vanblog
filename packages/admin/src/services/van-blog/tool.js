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
export const getRecentTimeDes = (timestr) => {
  if (!timestr || timestr == '') {
    return '-';
  }
  const c = moment().diff(moment(timestr), 'seconds');
  if (c <= 60) {
    return c + '秒前';
  } else if (c <= 60 * 60) {
    return Math.floor(c / 60) + '分钟前';
  } else if (c <= 60 * 60 * 60) {
    return Math.floor(c / 60 / 60) + '小时前';
  } else if (c <= 60 * 60 * 60 * 24) {
    return Math.floor(c / 60 / 60 / 24) + '天前';
  }
};
