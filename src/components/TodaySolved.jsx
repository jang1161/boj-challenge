import React, { useEffect, useState } from 'react'
import { fetchTodaySolvedProblems } from '../utils/bojApi'
import { supabase } from '../supabaseClient'

export default function TodaySolved({ members }) {
	const [solvedMap, setSolvedMap] = useState({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchAll() {
			setLoading(true)
			const map = {}
			for (const member of members) {
				const bojId = member.profiles?.boj_id
				if (!bojId) {
					map[member.user_id] = null // 백준 ID 없음
					continue
				}
				try {
					const solved = await fetchTodaySolvedProblems(bojId)
					// fetchTodaySolvedProblems에서 이미 배열을 반환하므로 그대로 사용
					map[member.user_id] = solved
				} catch (error) {
					console.error(`Error fetching for ${bojId}:`, error)
					map[member.user_id] = null
				}
			}
			setSolvedMap(map)
			setLoading(false)
		}
		fetchAll()
	}, [members])

	if (loading) {
		return <p className="text-center text-gray-500 py-4">오늘 푼 문제 불러오는 중...</p>
	}

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4">
			<h3 className="text-xl font-semibold text-gray-900 mb-4">오늘 푼 문제</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
				{[...members]
					.sort((a, b) => {
						const aSolved = solvedMap[a.user_id]?.length || 0
						const bSolved = solvedMap[b.user_id]?.length || 0
						return bSolved - aSolved // 많이 푼 순
					})
					.map((member) => {
						const nickname = member.profiles?.nickname || '닉네임 없음'
						const solved = solvedMap[member.user_id]

						return (
							<div key={member.user_id} className="bg-gray-50 rounded p-3">
								<div className="font-medium text-gray-900 mb-2">{nickname}</div>
								<div className="text-sm text-gray-700">
									{solved == null || solved.length === 0
										? '아직 안 풀었어요'
										: solved.map((pid) => (
											<a
												key={pid}
												href={`https://www.acmicpc.net/problem/${pid}`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-block text-blue-600 hover:underline mr-2 mb-1"
											>
												#{pid}
											</a>
										))}
								</div>
							</div>
						)
					})}
			</div>
		</div>
	)
}