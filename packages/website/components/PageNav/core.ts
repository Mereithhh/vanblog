export type PageItemType =
  | "pre-btn"
  | "pre-btn-disable"
  | "next-btn"
  | "next-btn-disable"
  | "link"
  | "link-cur"
  | "pre-more"
  | "next-more";
export interface PageItem {
  type: PageItemType;
  href: string;
  page: number;
}
export interface PageNavProps {
  total: number;
  current: number;
  base: string;
  more: string;
  pageSize?: number;
}
export const calItemList = (props: PageNavProps) => {
  const res: PageItem[] = [];
  const pageSize = props.pageSize || 5;
  const pageNum = Math.ceil(props.total / pageSize);
  // 计算一个 more 的 href
  let moreHref = props.current + 5;
  let lessHref = props.current - 5;
  if (moreHref > pageNum) {
    moreHref = pageNum;
  }
  if (lessHref < 1) {
    lessHref = 1;
  }
  if (props.current == 1) {
    // 先计算开始的
    res.push({
      type: "pre-btn-disable",
      href: `${props.base}`,
      page: 1,
    });
  } else {
    if (props.current - 1 == 1) {
      res.push({
        type: "pre-btn",
        href: `${props.base}`,
        page: 1,
      });
    } else {
      res.push({
        type: "pre-btn",
        href: `${props.more}/${props.current - 1}`,
        page: props.current - 1,
      });
    }
  }

  // 根据参数计算出要渲染的列表
  // 1. 如果页数小于7，那直接都渲染。
  if (pageNum <= 7) {
    for (let i = 1; i <= pageNum; i++) {
      res.push({
        type: i == props.current ? "link-cur" : "link",
        href: i == 1 ? `${props.base}` : `${props.more}/${i}`,
        page: i,
      });
    }
  } else {
    // 如果前4页, 那就是 xxxx, ... 模式
    if (props.current <= 4) {
      for (let i = 1; i <= 3; i++) {
        res.push({
          type: i == props.current ? "link-cur" : "link",
          href: i == 1 ? `${props.base}` : `${props.more}/${i}`,
          page: i,
        });
      }
      // 加一个item

      res.push({
        type: props.current == 4 ? "link-cur" : "link",
        href: `${props.more}/${4}`,
        page: 4,
      });

      // 然后一个 。。。
      res.push({
        type: "next-more",
        href: `${props.more}/${moreHref}`,
        page: moreHref,
      });
      // 然后一个 link
      res.push({
        type: "link",
        href: `${props.more}/${pageNum}`,
        page: pageNum,
      });
    }
    // 倒数4页内，那就是 ....,xxxx 模式
    else if (pageNum - props.current < 4) {
      res.push({
        type: "link",
        href: `${props.base}`,
        page: 1,
      });
      res.push({
        type: "pre-more",
        href: lessHref == 1 ? `${props.base}` : `${props.more}/${lessHref}`,
        page: lessHref,
      });
      // 剩下的4个
      for (let i = pageNum - 3; i <= pageNum; i++) {
        res.push({
          type: i == props.current ? "link-cur" : "link",
          href: `${props.more}/${i}`,
          page: i,
        });
      }
    }
    // 都不是，那就是中间模式
    else {
      // 首页
      res.push({
        type: "link",
        href: `${props.base}`,
        page: 1,
      });
      // 前面的 。。。
      res.push({
        type: "pre-more",
        href: lessHref == 1 ? `${props.base}` : `${props.more}/${lessHref}`,
        page: lessHref,
      });
      // 中间的3个
      res.push({
        type: "link",
        href: `${props.more}/${props.current - 1}`,
        page: props.current - 1,
      });
      res.push({
        type: "link-cur",
        href: `${props.more}/${props.current}`,
        page: props.current,
      });
      res.push({
        type: "link",
        href: `${props.more}/${props.current + 1}`,
        page: props.current + 1,
      });

      // 后面的 。。。
      res.push({
        type: "next-more",
        href: `${props.more}/${moreHref}`,
        page: moreHref,
      });
      // 尾页
      res.push({
        type: "link",
        href: `${props.more}/${pageNum}`,
        page: pageNum,
      });
    }
  }
  // 增加一个末尾按钮
  if (props.current == pageNum) {
    res.push({
      type: "next-btn-disable",
      href: `${props.more}/${pageNum}`,
      page: pageNum,
    });
  } else {
    res.push({
      type: "next-btn",
      href: `${props.more}/${props.current + 1}`,
      page: props.current + 1,
    });
  }
  return res;
};
