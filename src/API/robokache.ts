import utils from './utils';
import { api } from './baseUrlProxy';

// Base request method for all endpoints
async function baseRequest(path: string, method: string, body: any, token: string | null) {
  const config: {
    url: string;
    method: string;
    data: any;
    withCredentials: boolean;
    headers: {
      Accept: string;
      'Content-Type': string;
      Authorization?: string;
    };
  } = {
    url: `/api/robokache/${path}`,
    method,
    data: body,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    return utils.handleAxiosError(error as any);
  }
}

const routes = {
  async getQuestions(token: string | null) {
    return baseRequest('questions', 'GET', null, token);
  },
  async getAnswers(doc_id: any, token: string | null) {
    return baseRequest(`answers/${doc_id}`, 'GET', null, token);
  },

  async getQuestion(doc_id: any, token: string | null) {
    return baseRequest(`question/${doc_id}`, 'GET', null, token);
  },
  async getAnswer(doc_id: any, token: string | null) {
    return baseRequest(`question/${doc_id}`, 'GET', null, token);
  },

  async getQuestionData(doc_id: any, token: any) {
    const config = {
      url: `/api/robokache/question_data/${doc_id}`,
      method: 'GET',
      withCredentials: true,
      headers: {} as { Authorization?: string },
      transformResponse: (res: any) => res,
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error as any);
    }
  },
  async getAnswerData(doc_id: any, token: any) {
    const config = {
      url: `/api/robokache/answer_data/${doc_id}`,
      method: 'GET',
      withCredentials: true,
      headers: {} as { Authorization?: string },
      transformResponse: (res: any) => res,
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error as any);
    }
  },

  async setQuestionData(doc_id: any, newData: any, token: any) {
    const config = {
      url: `/api/robokache/question_data/${doc_id}`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {} as { Authorization?: string },
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error as any);
    }
  },
  async setAnswerData(doc_id: any, newData: any, token: any) {
    const config = {
      url: `/api/robokache/answer_data/${doc_id}`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {} as { Authorization?: string },
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error as any);
    }
  },

  async createQuestion(doc: any, token: string | null) {
    return baseRequest('question', 'POST', doc, token);
  },
  async createAnswer(doc: any, token: string | null) {
    return baseRequest('answer', 'POST', doc, token);
  },
  async updateQuestion(doc: { id: any }, token: string | null) {
    return baseRequest(`question/${doc.id}`, 'PUT', doc, token);
  },
  async updateAnswer(doc: { id: any }, token: string | null) {
    return baseRequest(`answer/${doc.id}`, 'PUT', doc, token);
  },
  async deleteQuestion(doc_id: any, token: string | null) {
    return baseRequest(`question/${doc_id}`, 'DELETE', undefined, token);
  },
  async deleteAnswer(doc_id: any, token: string | null) {
    return baseRequest(`answer/${doc_id}`, 'DELETE', undefined, token);
  },
};

export default routes;
