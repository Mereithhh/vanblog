// TODO: Add return types
export const searchArticles = async (query: string): Promise<any> => {
  try {
    const { data } = await fetch(`/api/public/search?value=${query}`).then(
      (res) => res.json()
    );

    return data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

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
