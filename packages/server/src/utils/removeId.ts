export function removeID(objArr: any[]) {
  return objArr.map((each) => {
    const { _id, ...rest } = each;
    return rest;
  });
}
