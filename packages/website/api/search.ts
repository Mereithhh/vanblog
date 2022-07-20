import { config } from "../utils/loadConfig";

export async function searchArticles(str: string): Promise<any> {
  try {
    const url = `/api/public/search?value=${str}`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
export async function searchWithApiRoute(str: string) {
  try {
    const url = `/api/search?value=${str}`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
