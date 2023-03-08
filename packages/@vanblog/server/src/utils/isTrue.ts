export function isTrue(v: boolean | string) {
  if (typeof v == 'string') {
    if (v == 'true') {
      return true;
    }
  }
  if (typeof v == 'boolean') {
    if (v == true) {
      return true;
    }
  }
  return false;
}
