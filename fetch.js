const https = require('https');
const cheerio = require('cheerio');
https.get('https://www.kmou.ac.kr/kmou/na/ntt/selectNttList.do?mi=2032&bbsId=10373&currPage=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const row = $('table.board_list tbody tr').first();
    console.log(row.html());
  });
});
