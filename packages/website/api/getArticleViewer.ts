import { isBuildTime } from '../utils/loadConfig';
import { apiClient } from './client';

export const getArticleViewer = async (id: number | string) => {
  if(isBuildTime) {
    return {
      viewer: 0,
      visited: 0
    };
  }

  const endpoint = `/api/public/article/viewer/${id}`;
  const response = await apiClient.get<{ statusCode: number; data: any }>(endpoint, undefined, 'getArticleViewer');
  return response.data;
};
