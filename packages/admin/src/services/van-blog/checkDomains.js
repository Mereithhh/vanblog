export const checkAllowDomains = (str) => {
  const arr = str.split(',');
  if (arr.includes(location.hostname)) {
    return true;
  } else {
    return false;
  }
};
