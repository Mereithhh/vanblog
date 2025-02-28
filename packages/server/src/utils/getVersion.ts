import axios from 'axios';
export const getVersionFromServer = async () => {
  try {
    let { data } = await axios.get('https://api.mereith.com/vanblog/version', {
      timeout: 1000, // 设置超时时间
    });
    data = data?.data || {};
    if (!data?.version) {
      return null;
    }
    return {
      version: data.version,
      updatedAt: data?.updatedAt || data?.upadtedAt,
    };
  } catch (err) {
    return null;
  }
};
