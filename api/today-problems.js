import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { user, count = 10 } = req.query;

  if (!user) {
    return res.status(400).json({ error: 'user query parameter is required' });
  }

  try {
    const url = `https://www.acmicpc.net/status?problem_id=&user_id=${encodeURIComponent(user)}&language_id=-1&result_id=4`;
		const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    const seen = new Set();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    for (let i = 1; i <= 100; i++) { // 충분히 큰 수
      const row = $(`#status-table > tbody > tr:nth-child(${i})`);
      if (row.length === 0) break;

      const cols = row.find('td');
      const problemId = $(cols[2]).find('a.problem_title').text().trim();

      const timestampStr = $(cols[8]).find('a').attr('data-timestamp');
      if (!timestampStr) break;

      const timestamp = parseInt(timestampStr, 10) * 1000;
      const solvedDate = new Date(timestamp);

      if (solvedDate < startOfToday) break;

      if (solvedDate >= startOfToday && solvedDate < startOfTomorrow) {
        if (seen.has(problemId)) continue;
        seen.add(problemId);
        results.push( problemId );

        if (results.length >= count) break;
      }
    }

    return res.status(200).json({ items: results });
  } catch (error) {
    console.error('오늘 푼 문제 크롤링 실패:', error);
    return res.status(500).json({ error: '크롤링 실패' });
  }
}