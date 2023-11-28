export const checkJsonString = (s: string) => {
  try {
    JSON.parse(s);
    return true;
  } catch (e) {
    return false;
  }
};
