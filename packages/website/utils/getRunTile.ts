export const getRunTimeOfDays = (since: Date) => {
  const now = new Date();
  const cha = now.valueOf() - since.valueOf();
  return Math.floor(cha / 3600 / 24 / 1000);
};
