const https = require('https');
const cheerio = require('cheerio');
const url = 'https://www.kmou.ac.kr/kmou/na/ntt/selectNttList.do?mi=2032&bbsId=10373&currPage=1&searchCnd=1&searchWrd=' + encodeURIComponent('국가근로');
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const rows = $('.BD_list table tbody tr');
    let count = 0;
    rows.each((i, el) => {
       const title = $(el).find('td.ta_l a').text().trim();
       if(title) { console.log(title); count++; }
    });
    console.log('Total found:', count);
  });
});
