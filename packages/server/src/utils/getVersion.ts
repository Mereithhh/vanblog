import axios from 'axios';
export const getVersionFromServer = async () => {
  try {
    let { data } = await axios.get('https://api.mereith.com/vanblog/version');
    data = data?.data || {};
    if (!data?.version) {
      return null;
    }
    return {
      version: data.version,
      updatedAt: data.updatedAt,
    };
  } catch (err) {
    return null;
  }
};
