import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ProfileForm() {
  const [bojId, setBojId] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const checkDuplicates = async () => {
    const { data: bojDup } = await supabase
      .from('profiles')
      .select('id')
      .eq('boj_id', bojId)
      .neq('id', userId) // 자신 제외

    if (bojDup.length > 0) {
      alert('이미 사용 중인 백준 아이디입니다.')
      return true
    }

    const { data: nickDup } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .neq('id', userId)

    if (nickDup.length > 0) {
      alert('이미 사용 중인 닉네임입니다.')
      return true
    }

    return false
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!bojId || !nickname) {
      alert('백준 아이디와 닉네임을 모두 입력해주세요')
      return
    }

    setLoading(true)

    const isDuplicate = await checkDuplicates()
    if (isDuplicate) {
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      boj_id: bojId,
      nickname: nickname,
    })

    setLoading(false)

    if (error) {
      alert('오류 발생: ' + error.message)
    } else {
      alert('프로필이 저장되었습니다!')
      window.location.reload()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: 'auto', marginTop: '100px' }}>
      <h2>프로필 입력</h2>

      <label>
        백준 ID:
        <input
          type="text"
          value={bojId}
          onChange={(e) => setBojId(e.target.value)}
          disabled={loading}
        />
      </label>

      <label>
        닉네임:
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}