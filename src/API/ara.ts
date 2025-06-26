import utils from './utils';
import { api } from './baseUrlProxy';

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} message message standard object
   */
  async getQuickAnswer(ara: any, message: any) {
    try {
      const response = await api.post(`/api/quick_answer/?ara=${ara}`, message);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error as any);
    }
  },

  async getAnswer(ara: any, questionId: any, token: any) {
    const config = {
      url: '/api/answer',
      method: 'POST',
      withCredentials: true,
      headers: {} as Record<string, string>,
      params: {
        questionId,
        ara,
      },
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (e) {
      return utils.handleAxiosError(e as any);
    }
  },
};

const routes = {
  getQuickAnswer: baseRoutes.getQuickAnswer,
  getAnswer: baseRoutes.getAnswer,
};

export default routes;
