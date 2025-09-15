import axios from 'axios';
import utils from './utils';

const METADATA_ROUTE = "https://robokop-automat.apps.renci.org";

export default {
  async registry(): Promise<string[] | ReturnType<typeof utils.handleAxiosError>> {
    try {
      const response = await axios( {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${METADATA_ROUTE}/registry`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },

  async metadata(graphId: string){
    try {
      const response = await axios( {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${METADATA_ROUTE}/${graphId}/metadata`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  }
};
