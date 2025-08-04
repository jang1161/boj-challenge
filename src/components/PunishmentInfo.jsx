import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function getWeekRange(date) {
	const day = date.getDay() // 일:0 ~ 토:6
	const diffToMonday = (day + 6) % 7 // 월:0, 화:1, ..., 일:6

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

// 0시 00분 00초
const startOfDay = (dateStr) => {
	const d = new Date(dateStr)
	d.setHours(0, 0, 0, 0)
	return d.toISOString()
}

// 23시 59분 59초
const endOfDay = (dateStr) => {
	const d = new Date(dateStr)
	d.setHours(23, 59, 59, 999)
	return d.toISOString()
}



function countPunishmentsByUser(punishments) {
	return punishments.reduce((acc, p) => {
		acc[p.user_id] = (acc[p.user_id] || 0) + 1
		return acc
	}, {})
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

			// 이번주 월~일
			const thisWeek = getWeekRange(today)
			setThisWeekRange(thisWeek)

			// 지난주 월~일 (이번주 월요일에서 -7일)
			const lastWeekMonday = new Date(thisWeek.start)
			lastWeekMonday.setDate(lastWeekMonday.getDate() - 7)
			const lastWeek = getWeekRange(lastWeekMonday)
			setLastWeekRange(lastWeek)

			// 지난주 벌칙 조회
			const { data: lastData, error: lastError } = await supabase
				.from('punishments')
				.select('id, user_id, profiles(nickname, boj_id), inserted_at')
				.eq('group_id', groupId)
				.gte('inserted_at', startOfDay(lastWeek.start))
				.lte('inserted_at', endOfDay(lastWeek.end))
				.order('inserted_at', { ascending: false })

			if (lastError) {
				alert('지난주 벌칙 정보를 불러오는 중 오류가 발생했습니다: ' + lastError.message)
			} else {
				setLastWeekPunishments(lastData)
			}

			// 이번주 벌칙 조회
			const { data: thisData, error: thisError } = await supabase
				.from('punishments')
				.select('id, user_id, profiles(nickname, boj_id), inserted_at')
				.eq('group_id', groupId)
				.gte('inserted_at', startOfDay(thisWeek.start))
				.lte('inserted_at', endOfDay(thisWeek.end))
				.order('inserted_at', { ascending: false })

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

	const lastWeekCount = countPunishmentsByUser(lastWeekPunishments)
	const thisWeekCount = countPunishmentsByUser(thisWeekPunishments)


	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">벌칙 현황</h2>

			<div className="flex gap-6">
				{/* 지난주 벌칙자 */}
				<section className="flex-1">
					<h3 className="text-lg font-semibold mb-2 text-red-600">
						지난주 벌칙자 ({lastWeekRange?.start.replace(/-/g, '/')} - {lastWeekRange?.end.replace(/-/g, '/')})
					</h3>
					{lastWeekPunishments.length ? (
						<ul className="divide-y divide-gray-200 max-h-48 overflow-auto">
							{lastWeekPunishments.map((p) => (
								<li key={p.id} className="py-2 flex justify-between items-center">
									<div>
										<p className="font-medium text-gray-900">
											{p.profiles?.nickname || '닉네임 없음'}{' '}
											<span className="text-xs text-gray-500 ml-1">
												({p.profiles?.boj_id || '백준 ID 없음'})
											</span>{' '}
											<span className="text-xs text-red-600 font-semibold ml-2">
												[{lastWeekCount[p.user_id]}회]
											</span>
											<span className="text-xs text-gray-400 ml-2">
												({new Date(p.inserted_at).toLocaleDateString()})
											</span>
										</p>
									</div>
									<div className="text-xs text-gray-400 whitespace-nowrap">
										{new Date(p.inserted_at).toLocaleDateString()}
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
					{thisWeekPunishments.length ? (
						<ul className="divide-y divide-gray-200 max-h-48 overflow-auto">
							{thisWeekPunishments.map((p) => (
								<li key={p.id} className="py-2 flex justify-between items-center">
									<div>
										<p className="font-medium text-gray-900">
											{p.profiles?.nickname || '닉네임 없음'}{' '}
											<span className="text-xs text-gray-500 ml-1">
												({p.profiles?.boj_id || '백준 ID 없음'})
											</span>{' '}
											<span className="text-xs text-blue-600 font-semibold ml-2">
												[{thisWeekCount[p.user_id]}회]
											</span>
											<span className="text-xs text-gray-400 ml-2">
												({new Date(p.inserted_at).toLocaleDateString()})
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
