export const sleep = (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export const mutiTry = async (t, fn, delay) => {
  for (let i = 0; i < t; i++) {
    fn();
    if (delay) await sleep(delay);
  }
};
