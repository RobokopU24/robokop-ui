import express from 'express';
import axios from 'axios';
import yaml from 'js-yaml';

import { handleAxiosError } from './utils.js';
import services from './services.js';

const router = express.Router();

router.route('/node_norm').post(async (req, res) => {
  try {
    const response = await axios.post(`${services.node_norm}/get_normalized_nodes`, req.body);
    return res.send(response.data);
  } catch (error) {
    if (axios.isCancel(error)) {
      return res.send({});
    }
    return res.send(handleAxiosError(error));
  }
});

router.route('/name_resolver').post(async (req, res) => {
  const config = {
    headers: {
      'Content-Type': 'text/plain',
    },
    params: {
      string: req.query.string,
      biolink_type: req.query.type,
      limit: req.query.limit,
    },
  };
  try {
    const response = await axios.post(`${services.name_resolver}/lookup`, {}, config);
    return res.send(response.data);
  } catch (error) {
    return res.send(handleAxiosError(error));
  }
});

router.route('/biolink').get(async (req, res) => {
  let response;
  try {
    console.log(services.biolink);
    response = await axios.get(services.biolink);
  } catch (error) {
    console.error('Error fetching Biolink model:', error);
    return res.status(500).send(handleAxiosError(error));
  }

  // Parse YAML into JSON
  try {
    const biolink = yaml.load(response.data); // js-yaml v4+ uses `.load`
    return res.json(biolink);
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Failed to load Biolink model specification: could not parse YAML',
    });
  }
});

export default router;
