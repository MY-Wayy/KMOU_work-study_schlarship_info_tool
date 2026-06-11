import * as cheerio from 'cheerio';
import https from 'https';

export async function scrapeKMOU() {
  const posts = [];
  const currentYear = new Date().getFullYear();
  // Cutoff is April 1st of the previous year
  const cutoffDateStr = `${currentYear - 1}.04.01`;

  // Custom fetch with https agent to avoid SSL issues if any
  const fetchPage = (page) => {
    return new Promise((resolve, reject) => {
      // Added search parameter for speed
      const url = `https://www.kmou.ac.kr/kmou/na/ntt/selectNttList.do?mi=2032&bbsId=10373&currPage=${page}&searchCnd=1&searchWrd=${encodeURIComponent('국가근로')}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ page, html: data }));
      }).on('error', err => reject(err));
    });
  };

  let startPage = 1;
  let shouldContinue = true;
  const seenPostIds = new Set();

  while (shouldContinue) {
    try {
      // Fetch 5 pages concurrently to massively speed up loading
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(fetchPage(startPage + i));
      }
      
      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (!shouldContinue) break;
        
        const $ = cheerio.load(result.html);
        const rows = $('.BD_list table tbody tr');
        
        if (rows.length === 0) {
          shouldContinue = false;
          break; // End of list
        }
        
        let newPostsOnPage = 0;

        // Select the table rows containing notice posts
        rows.each((i, el) => {
          if (!shouldContinue) return;
  
          const linkEl = $(el).find('td.ta_l a');
          if (!linkEl.length) return;
          
          const href = linkEl.attr('href');
          // Extract unique post ID (nttSn) to prevent duplicates across pages
          const nttSnMatch = href.match(/nttSn=(\d+)/);
          const postId = nttSnMatch ? nttSnMatch[1] : href;

          if (seenPostIds.has(postId)) {
            return;
          }
  
          // Find date column
          let dateStr = '';
          $(el).find('td').each((j, td) => {
            const text = $(td).text().trim();
            if (/^\d{4}\.\d{2}\.\d{2}$/.test(text)) {
              dateStr = text;
            }
          });
  
          // Check if pinned post
          const firstTd = $(el).find('td').first().text().trim();
          const isPinned = firstTd === '공지' || $(el).find('td').first().find('img').length > 0;
  
          // If date is older than cutoff and not a pinned post, stop crawling
          if (dateStr && dateStr < cutoffDateStr && !isPinned) {
            shouldContinue = false;
            return;
          }
  
          // If a pinned post is older, we just skip it but don't stop the crawler
          if (dateStr && dateStr < cutoffDateStr) {
            return;
          }
          
          seenPostIds.add(postId);
          newPostsOnPage++;
  
          let title = linkEl.text().trim();
  
          // Remove redundant whitespaces
          title = title.replace(/\s+/g, ' ');
  
          if (title.includes('국가근로')) {
            const yearMatch = title.match(/(20\d{2})(?:학년도|년도)/);
            const semesterMatch = title.match(/([12]학기|여름학기|겨울학기)/);
  
            let type = '기타 공지';
            if (title.includes('학생 신청기간') || title.includes('신청기간')) {
              type = '학생 신청기간 안내';
            } else if (title.includes('희망근로지')) {
              type = '희망근로지 신청 안내';
            } else if (title.includes('대체 장학생 모집') || title.includes('대체 장학생 선발 공고')) {
              type = '대체 장학생 모집/선발';
            } else if (title.includes('대체 장학생 선발 공지')) {
              type = '대체 장학생 선발 공지';
            } else if (title.includes('선발')) {
              type = '선발 공지';
            }
  
            const year = yearMatch ? `${yearMatch[1]}학년도` : '미상 학년도';
            const semester = semesterMatch ? semesterMatch[1] : '미상 학기';
            // Strip currPage from link for cleaner URLs
            const cleanHref = href.replace(/&currPage=\d+/, '');
            const link = cleanHref.startsWith('http') ? cleanHref : `https://www.kmou.ac.kr${cleanHref}`;
  
            posts.push({
              id: postId,
              title,
              year,
              semester,
              type,
              link
            });
          }
        });
        
        // If a page returned rows but all were already seen, it means the server is repeating the last page
        if (newPostsOnPage === 0) {
          shouldContinue = false;
          break;
        }
      }
      
      startPage += 5;
      // Safety break to prevent infinite loops
      if (startPage > 50) break;
    } catch (e) {
      console.error(`Error scraping pages starting from ${startPage}:`, e);
      break;
    }
  }

  // Build the hierarchical JSON tree
  const tree = {};

  posts.forEach(post => {
    if (!tree[post.year]) {
      tree[post.year] = {};
    }
    if (!tree[post.year][post.semester]) {
      tree[post.year][post.semester] = {};
    }
    if (!tree[post.year][post.semester][post.type]) {
      tree[post.year][post.semester][post.type] = [];
    }

    // Avoid duplicates
    const exists = tree[post.year][post.semester][post.type].find(p => p.link === post.link);
    if (!exists) {
      tree[post.year][post.semester][post.type].push(post);
    }
  });

  return tree;
}
