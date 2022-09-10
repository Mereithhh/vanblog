export const checkUrl = (url) => {
  let ok = true;
  try {
    new URL(url);
  } catch (err) {
    ok = false;
  }
  return ok;
};
