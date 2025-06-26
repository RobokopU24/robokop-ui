import utils from './utils';
import { api } from './baseUrlProxy';

const routes = {
  async getDrugChemicalPairs({
    pagination,
    sort,
    filters,
  }: {
    pagination: { pageIndex: number; pageSize: number };
    sort: any;
    filters: any;
  }) {
    let response;
    try {
      response = await api.post('/api/explore/drug-disease', {
        pagination: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
        },
        sort,
        filters,
      });
    } catch (error: any) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  },
};

export default routes;
