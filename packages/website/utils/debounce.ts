export function debounce(fn: any, delay: any) {
  let timer: any = null; //借助闭包
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-ignore
      fn.apply(this, arguments);
    }, delay); // 简化写法
  };
}
