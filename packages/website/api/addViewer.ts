import { config } from "../utils/loadConfig";

export async function addViewer(): Promise<any> {
  try {
    const url = `${config.baseUrl}api/public/viewer`;
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
  try {
    const url = `/api/viewer`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
