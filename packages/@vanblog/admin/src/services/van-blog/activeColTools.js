export const genActiveObj = (ks, allKeys) => {
  const res = {};
  allKeys.forEach((k) => {
    if (ks.includes(k)) {
      res[k] = { show: true };
    } else {
      res[k] = { show: false };
    }
  });
  return res;
};
export const decodeActiveObj = (o) => {
  const keys = [];
  for (const [k, v] of Object.entries(o)) {
    if (v?.show) {
      keys.push(k);
    }
  }
  return keys;
};
