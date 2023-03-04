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
