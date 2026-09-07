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

export const DEFAULT_PAGE_SIZE = 5;

/** How many pages the public list would render for this total. */
export function pageCount(total: number, pageSize?: number): number {
  const size = pageSize || DEFAULT_PAGE_SIZE;
  if (!Number.isFinite(total) || !Number.isFinite(size) || total <= 0 || size <= 0) {
    return 0;
  }
  return Math.ceil(total / size);
}

/**
 * Public PageNav URL for page N. Page 1 uses `base` (`/`); later pages use
 * `more/N` (`/page/N`). Same path the numbered links already generate.
 */
export function pageHref(base: string, more: string, page: number): string {
  return page <= 1 ? `${base}` : `${more}/${page}`;
}

/** Hide the whole pager (and jump control) when there is only one page. */
export function shouldShowPageNav(total: number, pageSize?: number): boolean {
  return pageCount(total, pageSize) > 1;
}

export const calItemList = (props: PageNavProps) => {
  const res: PageItem[] = [];
  const pageSize = props.pageSize || DEFAULT_PAGE_SIZE;
  const pageNum = pageCount(props.total, pageSize);
  const hrefOf = (page: number) => pageHref(props.base, props.more, page);
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
      href: hrefOf(1),
      page: 1,
    });
  } else {
    if (props.current - 1 == 1) {
      res.push({
        type: "pre-btn",
        href: hrefOf(1),
        page: 1,
      });
    } else {
      res.push({
        type: "pre-btn",
        href: hrefOf(props.current - 1),
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
        href: hrefOf(i),
        page: i,
      });
    }
  } else {
    // 如果前4页, 那就是 xxxx, ... 模式
    if (props.current <= 4) {
      for (let i = 1; i <= 3; i++) {
        res.push({
          type: i == props.current ? "link-cur" : "link",
          href: hrefOf(i),
          page: i,
        });
      }
      // 加一个item

      res.push({
        type: props.current == 4 ? "link-cur" : "link",
        href: hrefOf(4),
        page: 4,
      });

      // 然后一个 。。。
      res.push({
        type: "next-more",
        href: hrefOf(moreHref),
        page: moreHref,
      });
      // 然后一个 link
      res.push({
        type: "link",
        href: hrefOf(pageNum),
        page: pageNum,
      });
    }
    // 倒数4页内，那就是 ....,xxxx 模式
    else if (pageNum - props.current < 4) {
      res.push({
        type: "link",
        href: hrefOf(1),
        page: 1,
      });
      res.push({
        type: "pre-more",
        href: hrefOf(lessHref),
        page: lessHref,
      });
      // 剩下的4个
      for (let i = pageNum - 3; i <= pageNum; i++) {
        res.push({
          type: i == props.current ? "link-cur" : "link",
          href: hrefOf(i),
          page: i,
        });
      }
    }
    // 都不是，那就是中间模式
    else {
      // 首页
      res.push({
        type: "link",
        href: hrefOf(1),
        page: 1,
      });
      // 前面的 。。。
      res.push({
        type: "pre-more",
        href: hrefOf(lessHref),
        page: lessHref,
      });
      // 中间的3个
      res.push({
        type: "link",
        href: hrefOf(props.current - 1),
        page: props.current - 1,
      });
      res.push({
        type: "link-cur",
        href: hrefOf(props.current),
        page: props.current,
      });
      res.push({
        type: "link",
        href: hrefOf(props.current + 1),
        page: props.current + 1,
      });

      // 后面的 。。。
      res.push({
        type: "next-more",
        href: hrefOf(moreHref),
        page: moreHref,
      });
      // 尾页
      res.push({
        type: "link",
        href: hrefOf(pageNum),
        page: pageNum,
      });
    }
  }
  // 增加一个末尾按钮
  if (props.current == pageNum) {
    res.push({
      type: "next-btn-disable",
      href: hrefOf(pageNum),
      page: pageNum,
    });
  } else {
    res.push({
      type: "next-btn",
      href: hrefOf(props.current + 1),
      page: props.current + 1,
    });
  }
  return res;
};
