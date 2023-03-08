export const copyDocObj = (oldObj: any) => {
  const newObj: any = {};
  for (const [key, val] of Object.entries(oldObj._doc)) {
    newObj[key] = val;
  }
  return newObj;
};
