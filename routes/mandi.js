const express = require('express');
const axios = require('axios');
const router = express.Router();

const BASE_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

router.get('/mandi-prices', async (req, res) => {
  const {
    state,
    district,
    market,
    commodity,
    variety,
    grade,
    limit = 10,
    offset = 0
  } = req.query;

  const params = {
    'api-key': process.env.GOV_API_KEY,
    format: 'json',
    limit,
    offset,
  };

  if (!params['api-key']) {
    return res.status(400).json({ error: 'Missing API key in environment variables' });
  }

  if (state) params['filters[state.keyword]'] = state;
  if (district) params['filters[district]'] = district;
  if (market) params['filters[market]'] = market;
  if (commodity) params['filters[commodity]'] = commodity;
  if (variety) params['filters[variety]'] = variety;
  if (grade) params['filters[grade]'] = grade;

  try {
    const response = await axios.get(BASE_API_URL, { params });
    res.json(response.data.records || []);
  } catch (error) {
    console.error('Mandi API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch mandi data' });
  }
});

module.exports = router;
