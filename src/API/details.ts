import axios from 'axios';
import utils from './utils';
const baseRoutes = {
  async getNodeDetails(nodeId: string) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/node/${nodeId}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(config);

      return response.data;
      // return testData1;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },

  async getNodeEdges(
    nodeId: string,
    pageSize: number,
    pageNumber: number,
    predicate: string,
    category?: string
  ) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/edges/${nodeId}?limit=${pageSize}&offset=${
        pageNumber * pageSize
      }&predicate=${predicate === 'all' ? '' : predicate}${category ? `&category=${category}` : ''}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(config);

      return response.data;
      // return testData1;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },

  async getNodeEdgeSummary(nodeId: string) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/edge_summary/${nodeId}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(config);

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },

  async getNodeEdgeCount(nodeId: string) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://robokop-automat.apps.renci.org/robokopkg/edges/${nodeId}?count_only=true`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error as any);
    }
  },
};

const routes = {
  getNodeEdges: baseRoutes.getNodeEdges,
  getNodeDetails: baseRoutes.getNodeDetails,
  getNodeEdgeSummary: baseRoutes.getNodeEdgeSummary,
  getNodeEdgeCount: baseRoutes.getNodeEdgeCount,
};

export default routes;
