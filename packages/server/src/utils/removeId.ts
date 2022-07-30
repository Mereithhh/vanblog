export function removeID(objArr: any[]) {
  if (!objArr) {
    return null;
  }
  return objArr.map((each) => {
    const { _id, __v, ...rest } = each;
    return rest;
  });
}
