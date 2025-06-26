import utils from './utils';
import { api } from './baseUrlProxy';

const baseRoutes = {
  /**
   * Send a query graph to the server to ask an ARA for an answer
   * @param {string} questionId robokache question id
   * @param {object} questionData query graph object
   * @param {string} token jws token
   */
  async getAnswer(ara: any, questionId: any, token: any) {
    const config = {
      url: '/api/dispatcher',
      method: 'POST',
      params: {
        questionId,
        ara,
      },
      headers: {} as Record<string, string>,
    };
    config.headers.Authorization = token;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error as any);
    }
  },
};

const routes = {
  getAnswer: baseRoutes.getAnswer,
};

export default routes;
