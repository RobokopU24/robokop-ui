import axios from 'axios';
import API from '../API/routes';

export const getGraphMetadataDownloads = async (graphId: string): Promise<any> => {
  const res = await axios.get(API.fileRoutes.base + `/${graphId}`);
  return res.data;
};
