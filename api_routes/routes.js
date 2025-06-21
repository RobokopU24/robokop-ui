import express from 'express';
import axios from 'axios';

import { routes as robokacheRoutes, router as robokacheRouter } from './robokache.js';

import { handleAxiosError } from './utils.js';
import services from './services.js';
import external_apis from './external.js';
import { getDrugDiseasePairs } from '../explore/query/drug-disease.js';

const router = express.Router();

router.use('/', external_apis);
router.use('/robokache', robokacheRouter);

router.route('/quick_answer').post(async (req, res) => {
  const { ara } = req.query;
  const ara_url = services[ara];
  const config = {
    method: 'POST',
    url: ara_url,
    data: req.body,
    transformResponse: [(data) => data],
  };

  try {
    const response = await axios(config);

    try {
      const answer = JSON.parse(response.data);
      res.send(answer);
    } catch (error) {
      console.error(`Error parsing JSON response from ${ara}:`, error);
      res.send({
        status: 'error',
        message: `Received unparseable JSON response from ${ara}`,
      });
    }
  } catch (err) {
    console.error(`Error from ${ara_url}:`, err);
    res.send({
      status: 'error',
      message: `Error from ${ara_url}`,
    });
  }
});

router.route('/explore/drug-disease').post(async (req, res) => {
  const { sort, filters, pagination } = req.body;

  if (!pagination || !Number.isInteger(pagination.offset) || !Number.isInteger(pagination.limit))
    return res.status(400).json({ error: 'Missing pagination' });

  if (pagination.limit < 1 || pagination.offset < 0)
    return res.status(400).json({ error: 'Invalid limit or offset value' });

  const limit = Math.min(pagination.limit, 500);
  const { offset } = pagination;

  try {
    const results = await getDrugDiseasePairs({ sort, filters, pagination: { limit, offset } });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in explore page query:', error, req.body);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.route('/answer').post(async (req, res) => {
  const { questionId, ara } = req.query;
  try {
    let response = await robokacheRoutes.getQuestionData(questionId, req.headers.authorization); // ✅
    if (response.status === 'error') return res.send(response);

    const message = response;
    const ara_url = services[ara];
    const config = {
      method: 'POST',
      url: ara_url,
      data: message,
      transformResponse: [(data) => data],
    };

    let answer;
    try {
      response = await axios(config);
      try {
        answer = JSON.parse(response.data);
      } catch (error) {
        console.error(`Error parsing JSON response from ${ara}:`, error);
        answer = {
          status: 'error',
          message: `Received unparseable JSON response from ${ara}`,
        };
      }
    } catch (err) {
      answer = handleAxiosError(err);
    }

    response = await robokacheRoutes.createAnswer(
      { parent: questionId, visibility: 2 },
      req.headers.authorization
    );
    if (response.status === 'error') return res.send(response);

    const answerId = response.id;
    response = await robokacheRoutes.setAnswerData(answerId, answer, req.headers.authorization);
    if (response.status === 'error') return res.send(response);

    return res.status(200).send({ id: answerId });
  } catch (error) {
    return res.status(500).send(handleAxiosError(error));
  }
});

export default router;
