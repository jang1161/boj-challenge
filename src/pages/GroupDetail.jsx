import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TodaySolved from '../components/TodaySolved'

export default function GroupDetail() {
	const { groupId } = useParams()
	const navigate = useNavigate()
	const [group, setGroup] = useState(null)
	const [members, setMembers] = useState([])
	const [owner, setOwner] = useState(null)
	const [loading, setLoading] = useState(true)
	const [userId, setUserId] = useState(null)

	useEffect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			if (user) setUserId(user.id)
		})
	}, [])

	useEffect(() => {
		if (groupId) {
			fetchGroupDetails()
		}
	}, [groupId])

	const fetchGroupDetails = async () => {
		setLoading(true)

		// 그룹 정보 조회
		const { data: groupData, error: groupError } = await supabase
			.from('groups')
			.select('*')
			.eq('id', groupId)
			.single()

		if (groupError) {
			alert('그룹 정보를 불러올 수 없습니다: ' + groupError.message)
			navigate('/')
			return
		}

		setGroup(groupData)

		// 그룹원 목록 조회
		const { data: membersData, error: membersError } = await supabase
			.from('group_members')
			.select(`
				user_id,
				profiles:user_id (
					nickname,
                    boj_id
				)
			`)
			.eq('group_id', groupId)

		if (membersError) {
			alert('그룹원 정보를 불러올 수 없습니다: ' + membersError.message)
			setLoading(false)
			return
		}

		setMembers(membersData)

		// 그룹장 정보 조회
		if (groupData.owner) {
			const { data: ownerData, error: ownerError } = await supabase
				.from('profiles')
				.select('nickname')
				.eq('id', groupData.owner)
				.single()

			if (!ownerError) {
				setOwner(ownerData)
			}
		}

		setLoading(false)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">로딩 중...</p>
				</div>
			</div>
		)
	}

	if (!group) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">그룹을 찾을 수 없습니다.</p>
					<button
						onClick={() => navigate('/')}
						className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
					>
						홈으로 돌아가기
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* 헤더 */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
					<button
						onClick={() => navigate('/')}
						className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						뒤로 가기
					</button>
					<h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
					{group.description && (
						<p className="text-gray-600 mt-2">{group.description}</p>
					)}
				</div>

				{/* 그룹 정보 */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
						<div>
							<span className="text-gray-600">그룹원 수</span>
							<p className="font-medium">{members.length}명</p>
						</div>
						{group.password && (
							<div>
								<span className="text-gray-600">비밀번호</span>
								<p className="font-medium">설정됨</p>
							</div>
						)}
						{group.rest_days && group.rest_days.length > 0 && (
							<div>
								<span className="text-gray-600">쉬는 요일</span>
								<p className="font-medium">{group.rest_days.join(', ')}</p>
							</div>
						)}
						{group.penalty_reset_day && (
							<div>
								<span className="text-gray-600">벌칙 초기화</span>
								<p className="font-medium">{group.penalty_reset_day}</p>
							</div>
						)}
						{owner && (
							<div>
								<span className="text-gray-600">그룹장</span>
								<p className="font-medium">{owner.nickname}</p>
							</div>
						)}
					</div>
				</div>

				<TodaySolved members={members} />

				{/* 그룹원 목록 */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">그룹원 목록</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{members.map((member) => (
							<div
								key={member.user_id}
								className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
								onClick={() => navigate(`/users/${member.user_id}`)}
							>
								<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
									<span className="text-blue-800 font-semibold text-xs">
										{member.profiles?.nickname?.charAt(0).toUpperCase() || '?'}
									</span>
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-1">
										<p className="font-medium text-gray-900 text-sm truncate">
											{member.profiles?.nickname || '닉네임 없음'}
										</p>
										{member.user_id === group.owner && (
											<span className="text-xs text-yellow-600 font-medium">👑</span>
										)}
									</div>
									<p className="text-xs text-gray-500 truncate">
										{member.profiles?.boj_id ? `백준ID: ${member.profiles.boj_id}` : '백준 ID 없음'}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}