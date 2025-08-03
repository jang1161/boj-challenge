import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bojId, setBojId] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const checkDuplicates = async () => {
    const { data: bojDup } = await supabase
      .from('profiles')
      .select('id')
      .eq('boj_id', bojId)

    if (bojDup.length > 0) {
      alert('이미 사용 중인 백준 아이디입니다.')
      return true
    }

    const { data: nickDup } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)

    if (nickDup.length > 0) {
      alert('이미 사용 중인 닉네임입니다.')
      return true
    }

    return false
  }

  const handleSubmit = async () => {
    if (!email || !password) return alert('이메일과 비밀번호를 모두 입력해주세요.')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(error.message)
      } else {
        navigate('/')
      }
    } else {
      if (!bojId || !nickname) return alert('백준 아이디와 닉네임을 모두 입력해주세요.')

      const isDuplicate = await checkDuplicates()
      if (isDuplicate) return

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert(error.message)
      } else {
        // 회원가입 성공 시 프로필 정보 저장
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          boj_id: bojId,
          nickname: nickname,
        })

        if (profileError) {
          alert('프로필 저장 중 오류가 발생했습니다: ' + profileError.message)
        } else {
          alert('회원가입이 완료되었습니다!')
          navigate('/')
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isLogin ? '로그인' : '회원가입'}
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="백준 아이디"
                value={bojId}
                onChange={(e) => setBojId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </div>

        <p
          className="mt-4 text-center text-blue-600 hover:underline cursor-pointer text-sm"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? '→ 회원가입 하러가기' : '← 로그인으로 돌아가기'}
        </p>
      </div>
    </div>
  )
}