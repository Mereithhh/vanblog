export const checkTrue = (s: string | boolean) => {
  if (!s) return false;
  if (s == 'true') return true;
  if (s == true) return true;
  return false;
};
