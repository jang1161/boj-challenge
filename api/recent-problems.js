import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { user, count = 20 } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing 'user' parameter" });
  }

  const url = `https://www.acmicpc.net/status?problem_id=&user_id=${encodeURIComponent(user)}&language_id=-1&result_id=4`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) throw new Error(`Failed to fetch BOJ page, status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    const seen = new Set();
    let rowIndex = 1;

    while (results.length < count) {
      const row = $(`#status-table > tbody > tr:nth-child(${rowIndex})`);
      if (row.length === 0) break; // 더 이상 행이 없으면 종료

      const cols = row.find("td");
      const problemId = $(cols[2]).text().trim();

      // 중복 제거
      if (!seen.has(problemId)) {
        seen.add(problemId);
        results.push({ problemId });
      }

      rowIndex++;
    }


    res.status(200).json({ items: results });
  } catch (err) {
    console.error("크롤링 실패:", err);  // 콘솔에 에러 찍기

    res.status(500).json({
      error: "크롤링 실패",
      detail: err.message  // 프론트에서 받을 수 있도록 상세 메시지도 전송
    });
  }
}
