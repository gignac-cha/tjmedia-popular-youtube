const { URL } = require('url');
const axios = require('axios');

exports.handler = async (e) => {
  const url = new URL('http://www.tjmedia.co.kr/tjsong/song_monthPopular.asp');
  Object.entries(e.searchParams).map(([k, v]) => url.searchParams.set(k, v));
  // url.searchParams.set('strType', e.strType);
  // url.searchParams.set('SYY', e.SYY);
  // url.searchParams.set('SMM', e.SMM);
  // url.searchParams.set('SDD', e.SDD);
  // url.searchParams.set('EYY', e.EYY);
  // url.searchParams.set('EMM', e.EMM);
  // url.searchParams.set('EDD', e.EDD);
  const { data } = await axios.get(url.toString());
  return data;
};
