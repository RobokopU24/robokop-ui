import { u as utils } from './queryGraph-DEhAVldC.mjs';
import { b as api } from './baseUrlProxy-CL-Lrxdy.mjs';
import axios from 'axios';
import React from 'react';

async function baseRequest(path, method, body, token) {
  const config = {
    url: `/api/robokache/${path}`,
    method,
    data: body,
    withCredentials: true,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    return utils.handleAxiosError(error);
  }
}
const routes$3 = {
  async getQuestions(token) {
    return baseRequest("questions", "GET", null, token);
  },
  async getAnswers(doc_id, token) {
    return baseRequest(`answers/${doc_id}`, "GET", null, token);
  },
  async getQuestion(doc_id, token) {
    return baseRequest(`question/${doc_id}`, "GET", null, token);
  },
  async getAnswer(doc_id, token) {
    return baseRequest(`question/${doc_id}`, "GET", null, token);
  },
  async getQuestionData(doc_id, token) {
    const config = {
      url: `/api/robokache/question_data/${doc_id}`,
      method: "GET",
      withCredentials: true,
      headers: {},
      transformResponse: (res) => res
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async getAnswerData(doc_id, token) {
    const config = {
      url: `/api/robokache/answer_data/${doc_id}`,
      method: "GET",
      withCredentials: true,
      headers: {},
      transformResponse: (res) => res
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async setQuestionData(doc_id, newData, token) {
    const config = {
      url: `/api/robokache/question_data/${doc_id}`,
      method: "PUT",
      data: newData,
      withCredentials: true,
      headers: {}
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async setAnswerData(doc_id, newData, token) {
    const config = {
      url: `/api/robokache/answer_data/${doc_id}`,
      method: "PUT",
      data: newData,
      withCredentials: true,
      headers: {}
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async createQuestion(doc, token) {
    return baseRequest("question", "POST", doc, token);
  },
  async createAnswer(doc, token) {
    return baseRequest("answer", "POST", doc, token);
  },
  async updateQuestion(doc, token) {
    return baseRequest(`question/${doc.id}`, "PUT", doc, token);
  },
  async updateAnswer(doc, token) {
    return baseRequest(`answer/${doc.id}`, "PUT", doc, token);
  },
  async deleteQuestion(doc_id, token) {
    return baseRequest(`question/${doc_id}`, "DELETE", void 0, token);
  },
  async deleteAnswer(doc_id, token) {
    return baseRequest(`answer/${doc_id}`, "DELETE", void 0, token);
  }
};
const baseRoutes$1 = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} message message standard object
   */
  async getQuickAnswer(ara, message) {
    try {
      const response = await api.post(`/api/quick_answer/?ara=${ara}`, message);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async getAnswer(ara, questionId, token) {
    const config = {
      url: "/api/answer",
      method: "POST",
      withCredentials: true,
      headers: {},
      params: {
        questionId,
        ara
      }
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (e) {
      return utils.handleAxiosError(e);
    }
  }
};
const routes$2 = {
  getQuickAnswer: baseRoutes$1.getQuickAnswer,
  getAnswer: baseRoutes$1.getAnswer
};
const routes$1 = {
  /**
   * Get biolink model specification
   */
  async getModelSpecification() {
    let response;
    try {
      response = await api.get("/api/biolink");
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  }
};
const baseRoutes = {
  /**
   * Look up possible entities using a search string
   */
  async entityLookup(search_string, limit, cancel, type) {
    const config = {
      headers: {
        "Content-Type": "text/plain"
      },
      params: {
        string: search_string,
        type,
        limit
      },
      cancelToken: cancel
    };
    try {
      const response = await api.post("/api/name_resolver", {}, config);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error);
    }
  }
};
const routes = {
  entityLookup: baseRoutes.entityLookup
};
const API = {
  cache: routes$3,
  ara: routes$2,
  biolink: routes$1,
  nameResolver: routes
};
const BiolinkContext = React.createContext({});

export { API as A, BiolinkContext as B };
//# sourceMappingURL=biolink-BMtGoYHa.mjs.map
