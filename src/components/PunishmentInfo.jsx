import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// 특정 날짜 기준으로 그 주 월~일 구하기
function getWeekRange(date) {
	const day = date.getDay() // 일: 0 ~ 토: 6
	const diffToMonday = (day + 6) % 7 // 월: 0, 화: 1, ..., 일: 6

	const monday = new Date(date)
	monday.setDate(date.getDate() - diffToMonday)

	const sunday = new Date(monday)
	sunday.setDate(monday.getDate() + 6)

	const formatDate = (d) => {
		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	return { start: formatDate(monday), end: formatDate(sunday) }
}

// 유저별 벌칙 묶기 및 횟수, 날짜 리스트 생성
function groupPunishmentsByUser(punishments) {
	const grouped = {}

	punishments.forEach((p) => {
		if (!grouped[p.user_id]) {
			grouped[p.user_id] = {
				user_id: p.user_id,
				nickname: p.profiles?.nickname || '닉네임 없음',
				boj_id: p.profiles?.boj_id || '백준 ID 없음',
				dates: [],
				count: 0,
			}
		}
		grouped[p.user_id].count += 1
		// 날짜 포맷: 월/일 (예: 8/4)
		grouped[p.user_id].dates.push(
			new Date(p.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
		)
	})

	return Object.values(grouped)
}

export default function PunishmentInfo({ groupId }) {
	const [lastWeekPunishments, setLastWeekPunishments] = useState([])
	const [thisWeekPunishments, setThisWeekPunishments] = useState([])
	const [loading, setLoading] = useState(true)
	const [lastWeekRange, setLastWeekRange] = useState(null)
	const [thisWeekRange, setThisWeekRange] = useState(null)

	useEffect(() => {
		if (!groupId) return

		const fetchPunishments = async () => {
			setLoading(true)
			const today = new Date()

			// 이번주: 오늘 기준
			const thisWeek = getWeekRange(today)
			setThisWeekRange(thisWeek)

			// 지난주: 이번주 월요일 기준 -7일
			const mondayOfThisWeek = new Date(thisWeek.start)
			mondayOfThisWeek.setDate(mondayOfThisWeek.getDate() - 7)
			const lastWeek = getWeekRange(mondayOfThisWeek)
			setLastWeekRange(lastWeek)

			// 지난주 벌칙 조회
			const { data: lastData, error: lastError } = await supabase
				.from('punishments')
				.select('id, user_id, profiles(nickname, boj_id), date')
				.eq('group_id', groupId)
				.gte('date', lastWeek.start)
				.lte('date', lastWeek.end)
				.order('date', { ascending: false })

			if (lastError) {
				alert('지난주 벌칙 정보를 불러오는 중 오류가 발생했습니다: ' + lastError.message)
			} else {
				setLastWeekPunishments(lastData)
			}

			// 이번주 벌칙 조회
			const { data: thisData, error: thisError } = await supabase
				.from('punishments')
				.select('id, user_id, profiles(nickname, boj_id), date')
				.eq('group_id', groupId)
				.gte('date', thisWeek.start)
				.lte('date', thisWeek.end)
				.order('date', { ascending: false })

			if (thisError) {
				alert('이번주 벌칙 정보를 불러오는 중 오류가 발생했습니다: ' + thisError.message)
			} else {
				setThisWeekPunishments(thisData)
			}

			setLoading(false)
		}

		fetchPunishments()
	}, [groupId])

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 text-center text-gray-500">
				벌칙 정보를 불러오는 중...
			</div>
		)
	}

	const groupedLastWeek = groupPunishmentsByUser(lastWeekPunishments)
	const groupedThisWeek = groupPunishmentsByUser(thisWeekPunishments)

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">벌칙 현황</h2>

			<div className="flex gap-6">
				{/* 지난주 벌칙자 */}
				<section className="flex-1">
					<h3 className="text-lg font-semibold mb-2 text-red-600">
						지난주 벌칙자 ({lastWeekRange?.start.replace(/-/g, '/')} - {lastWeekRange?.end.replace(/-/g, '/')})
					</h3>
					{groupedLastWeek.length ? (
						<ul className="divide-y divide-gray-200 max-h-48 overflow-auto">
							{groupedLastWeek.map(({ user_id, nickname, boj_id, count, dates }) => (
								<li key={user_id} className="py-2 flex justify-between items-center">
									<div>
										<p className="font-medium text-gray-900">
											{nickname}{' '}
											<span className="text-xs text-gray-500 ml-1">({boj_id})</span>{' '}
											<span className="text-xs text-red-600 font-semibold ml-2">
												[{count}회] <span className="text-xs text-gray-500 ml-1">({dates.join(', ')})</span>
											</span>
										</p>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">지난주 벌칙자가 없습니다.</p>
					)}
				</section>

				{/* 이번주 벌칙자 */}
				<section className="flex-1">
					<h3 className="text-lg font-semibold mb-2 text-blue-600">
						이번주 벌칙자 ({thisWeekRange?.start.replace(/-/g, '/')} - {thisWeekRange?.end.replace(/-/g, '/')})
					</h3>
					{groupedThisWeek.length ? (
						<ul className="divide-y divide-gray-200 max-h-48 overflow-auto">
							{groupedThisWeek.map(({ user_id, nickname, boj_id, count, dates }) => (
								<li key={user_id} className="py-2 flex justify-between items-center">
									<div>
										<p className="font-medium text-gray-900">
											{nickname}{' '}
											<span className="text-xs text-gray-500 ml-1">({boj_id})</span>{' '}
											<span className="text-xs text-blue-600 font-semibold ml-2">
												[{count}회] <span className="text-xs text-gray-500 ml-1">({dates.join(', ')})</span>
											</span>
										</p>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">이번주 벌칙자가 없습니다.</p>
					)}
				</section>
			</div>
		</div>
	)
}
