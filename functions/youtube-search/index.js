const { URL } = require('url');
const axios = require('axios');

exports.handler = async (e) => {
  const url = new URL('https://www.youtube.com/results');
  Object.entries(e.searchParams).map(([k, v]) => url.searchParams.set(k, v));
  const { data } = await axios.get(url.toString());
  return data;
};
