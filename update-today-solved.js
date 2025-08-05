import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('[START] 오늘 푼 문제 업데이트 시작')

  const { data: members, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      profiles:user_id (
        id,
        boj_id
      )
    `)

  if (error) {
    console.error('[ERROR] 멤버 불러오기 실패:', error)
    return
  }

  for (const member of members) {
    const userId = member.user_id
    const bojId = member.profiles?.boj_id

    if (!bojId) {
      console.log(`[SKIP] boj_id 없음 - ${userId}`)
      continue
    }

    try {
      const res = await fetch(`https://boj-challenge.vercel.app/api/solved-yesterday?user=${encodeURIComponent(bojId)}`)
      const data = await res.json()

      const solved = data.hasSolvedYesterday
      console.log(`[${bojId}] 어제 풀었는지: ${solved}`)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ today_solved: solved })
        .eq('id', userId)

      if (updateError) {
        console.error(`[FAIL] DB 업데이트 실패 (${bojId}):`, updateError)
      } else {
        console.log(`[OK] ${bojId} → today_solved = ${solved}`)
      }
    } catch (err) {
      console.error(`[ERROR] ${bojId} 처리 중 오류:`, err)
    }

    // 너무 빠르게 요청하면 막힐 수 있어서 약간 쉬어줌
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log('[DONE] 업데이트 완료')
}

main()
