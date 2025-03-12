import { apiClient } from './client';

export async function searchArticles(str: string): Promise<any> {
  try {
    const endpoint = `/api/public/search`;
    const params = { value: str };
    const response = await apiClient.get<{ statusCode: number; data: { total: number; data: any } }>(endpoint, params, 'searchArticles');
    return response.data.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
