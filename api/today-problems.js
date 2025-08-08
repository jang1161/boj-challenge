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

    // ✅ KST(UTC+9) 기준 오늘 시작, 내일 시작
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간
    const kstNow = new Date(now.getTime() + kstOffset);

    const startOfTodayKST = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate());
    const startOfTomorrowKST = new Date(startOfTodayKST.getTime() + 24 * 60 * 60 * 1000);

    // UTC로 변환
    const startOfTodayUTC = new Date(startOfTodayKST.getTime() - kstOffset);
    const startOfTomorrowUTC = new Date(startOfTomorrowKST.getTime() - kstOffset);

    console.log("=== 기준 시각(KST → UTC 변환) ===");
    console.log("KST 오늘 시작:", startOfTodayKST.toISOString());
    console.log("UTC 오늘 시작:", startOfTodayUTC.toISOString());
    console.log("KST 내일 시작:", startOfTomorrowKST.toISOString());
    console.log("UTC 내일 시작:", startOfTomorrowUTC.toISOString());

    for (let i = 1; i <= 100; i++) {
      const row = $(`#status-table > tbody > tr:nth-child(${i})`);
      if (row.length === 0) break;

      const cols = row.find('td');
      const problemId = $(cols[2]).find('a.problem_title').text().trim();

      const timestampStr = $(cols[8]).find('a').attr('data-timestamp');
      if (!timestampStr) break;

      const timestamp = parseInt(timestampStr, 10) * 1000;
      const solvedDate = new Date(timestamp);

      // 로그 찍기
      console.log(`Row ${i} | 문제ID: ${problemId} | timestamp: ${timestampStr} | UTC: ${solvedDate.toISOString()} | KST: ${new Date(solvedDate.getTime() + kstOffset).toISOString()}`);

      if (solvedDate < startOfTodayUTC) break;

      if (solvedDate >= startOfTodayUTC && solvedDate < startOfTomorrowUTC) {
        if (seen.has(problemId)) continue;
        seen.add(problemId);
        results.push(problemId);

        if (results.length >= count) break;
      }
    }

    return res.status(200).json({ items: results });
  } catch (error) {
    console.error('오늘 푼 문제 크롤링 실패:', error);
    return res.status(500).json({ error: '크롤링 실패' });
  }
}
