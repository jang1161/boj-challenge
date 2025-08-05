import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export default async function handler(req, res) {
  const { user } = req.query
  if (!user) {
    return res.status(400).json({ error: 'user query parameter is required' })
  }

  try {
    // 1. /api/solved-yesterday 호출 (내부 API 호출)
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/solved-yesterday?user=${encodeURIComponent(user)}`
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`)
    }

    const data = await response.json()
    // data.hasSolvedYesterday = true / false (예상)

    // 2. supabase 프로필 업데이트
    const { error } = await supabase
      .from('profiles')
      .update({ today_solved: data.hasSolvedYesterday })
      .eq('id', user)

    if (error) {
      console.error('Supabase 업데이트 에러:', error)
      return res.status(500).json({ error: 'DB 업데이트 실패' })
    }

    return res.status(200).json({ message: 'today_solved 업데이트 완료', solved: data.hasSolvedYesterday })
  } catch (error) {
    console.error('에러 발생:', error)
    return res.status(500).json({ error: error.message || '서버 에러' })
  }
}
