import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const WEEKDAYS = [
  { label: '월요일', value: 'Mon' },
  { label: '화요일', value: 'Tue' },
  { label: '수요일', value: 'Wed' },
  { label: '목요일', value: 'Thu' },
  { label: '금요일', value: 'Fri' },
  { label: '토요일', value: 'Sat' },
  { label: '일요일', value: 'Sun' },
]

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('')
  const [password, setPassword] = useState('')
  const [restDays, setRestDays] = useState([])
  const [groupNameExists, setGroupNameExists] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  useEffect(() => {
    if (!groupName) {
      setGroupNameExists(false)
      return
    }

    const checkGroupName = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id')
        .eq('name', groupName)
        .limit(1)
        .single()
      setGroupNameExists(!!data)
    }

    checkGroupName()
  }, [groupName])

  const toggleRestDay = (day) => {
    setRestDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!groupName) return alert('그룹 이름을 입력하세요.')
    if (groupNameExists) return alert('이미 존재하는 그룹 이름입니다.')
    if (!userId) return alert('로그인이 필요합니다.')

    setLoading(true)

    // 사용자가 만든 그룹 수 조회
    const { data: existingGroups, error: fetchError } = await supabase
      .from('groups')
      .select('id')
      .eq('owner', userId)

    if (fetchError) {
      alert('그룹 정보를 불러오는 중 오류가 발생했습니다: ' + fetchError.message)
      setLoading(false)
      return
    }

    if (existingGroups.length >= 5) {
      alert('그룹은 최대 5개까지만 생성할 수 있습니다.')
      setLoading(false)
      return
    }

    // 그룹 생성
    const { data: newGroup, error } = await supabase
      .from('groups')
      .insert([
        {
          name: groupName,
          owner: userId,
          password: password || null,
          rest_days: restDays,
          // penalty_reset_day 필드는 아예 제거
        },
      ])
      .select() // insert 후 데이터 받아오기 위해
      .single()

    if (error) {
      setLoading(false)
      alert('그룹 생성 실패: ' + error.message)
      return
    }

    // 그룹 생성자 자동 가입
    const { error: joinError } = await supabase
      .from('group_members')
      .insert([{ group_id: newGroup.id, user_id: userId }])

    setLoading(false)

    if (joinError) {
      alert('그룹 가입 실패: ' + joinError.message)
    } else {
      alert('그룹이 생성되었습니다!')
      setGroupName('')
      setPassword('')
      setRestDays([])
      navigate('/')
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">그룹 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 그룹 이름 */}
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="groupName">
            그룹 이름
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={loading}
            maxLength={20}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              groupNameExists ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="그룹 이름을 입력하세요 (최대 20자)"
          />
          {groupNameExists && (
            <p className="mt-1 text-sm text-red-600">이미 존재하는 그룹 이름입니다.</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
            비밀번호 (선택)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호를 입력하세요 (최대 10자)"
          />
        </div>

        {/* 쉬는 날 */}
        <div>
          <span className="block text-gray-700 font-medium mb-2">쉬는 날</span>
          <div className="flex flex-wrap gap-4">
            {WEEKDAYS.map(({ label, value }) => (
              <label key={value} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={restDays.includes(value)}
                  onChange={() => toggleRestDay(value)}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-200 disabled:bg-gray-400"
        >
          {loading ? '생성 중...' : '그룹 생성'}
        </button>
      </form>
    </div>
  )
}
