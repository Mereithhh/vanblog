export function topUpper(str: string) {
  const sarr = str.split("");
  sarr[0] = sarr[0].toLocaleUpperCase();
  return sarr.join("");
}
