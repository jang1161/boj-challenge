import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { user } = req.query;

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

    const now = new Date();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 1; i <= 100; i++) {
      const row = $(`#status-table > tbody > tr:nth-child(${i})`);
      if (row.length === 0) break;

      const timestampStr = row.find('td:nth-child(9) a').attr('data-timestamp');
      if (!timestampStr) continue;

      const timestamp = parseInt(timestampStr, 10) * 1000;
      const solvedDate = new Date(timestamp);

      if (solvedDate >= startOfYesterday && solvedDate < endOfYesterday) {
        return res.status(200).json({ solved: true });
      }

      if (solvedDate < startOfYesterday) break; // 어제 이전이므로 더 볼 필요 없음
    }

    return res.status(200).json({ solved: false });
  } catch (error) {
    console.error(`어제 푼 문제 확인 실패 (${user}):`, error);
    return res.status(500).json({ error: '크롤링 실패' });
  }
}
