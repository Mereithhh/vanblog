export async function addViewer(pathname: string): Promise<any> {
  let isNew = true;
  if (window.localStorage.getItem("visited")) {
    isNew = false;
  } else {
    window.localStorage.setItem("visited", "true");
  }
  let isNewByPath = true;
  if (window.localStorage.getItem(`visited-${pathname}`)) {
    isNewByPath = false;
  } else {
    window.localStorage.setItem(`visited-${pathname}`, "true");
  }

  try {
    const url = `/api/public/viewer?isNew=${isNew}&isNewByPath=${isNewByPath}`;
    const res = await fetch(url, {
      method: "POST",
    });
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
export async function addViewerWithApiRoute() {
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
}
