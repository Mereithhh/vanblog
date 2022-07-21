export function removeID(objArr: any[]) {
  return objArr.map((each) => {
    const { _id,__v, ...rest } = each;
    return rest;
  });
}
