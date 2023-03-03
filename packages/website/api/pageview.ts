const DEFAULT_PAGEVIEW_RESPONSE = { viewer: 0, visited: 0 };

export interface PageViewData {
  viewer: number;
  visited: number;
}

export const updatePageview = async (
  pathname: string
): Promise<PageViewData> => {
  const hasVisited = window.localStorage.getItem("visited");
  const hasVisitedCurrentPath = window.localStorage.getItem(
    `visited-${pathname}`
  );

  if (!hasVisited) {
    window.localStorage.setItem("visited", "true");
  }

  if (!hasVisitedCurrentPath) {
    window.localStorage.setItem(`visited-${pathname}`, "true");
  }

  try {
    const { statusCode, data } = await fetch(
      `/api/public/viewer?isNew=${!hasVisited}&isNewByPath=${!hasVisitedCurrentPath}`,
      { method: "POST" }
    ).then((res) => res.json());

    return statusCode === 233 ? DEFAULT_PAGEVIEW_RESPONSE : data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addViewerWithApiRoute = async () => {
  let isNew = true;
  if (window.localStorage.getItem("visited")) {
    isNew = false;
  } else {
    window.localStorage.setItem("visited", "true");
  }
  try {
    const url = `/api/viewer?isNew=${isNew}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
