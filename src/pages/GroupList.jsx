// GroupList.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import GroupCard from '../components/GroupCard'
import GroupSection from '../components/GroupSection'
import LoadingSpinner from '../components/LoadingSpinner'
import Auth from './Auth'

export default function GroupList({ session }) {
	const [groups, setGroups] = useState([])
	const [joinedGroupIds, setJoinedGroupIds] = useState(new Set())
	const [loading, setLoading] = useState(false)
	const [userId, setUserId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			if (user) setUserId(user.id)
		})
	}, [])

	const filteredGroups = groups.filter((group) =>
		group.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const fetchGroupsAndMemberships = async () => {
		setLoading(true)

		const { data: groupsData, error: groupsError } = await supabase.from('groups').select('*')
		if (groupsError) {
			alert('그룹 목록 불러오기 실패: ' + groupsError.message)
			setLoading(false)
			return
		}

		setGroups(groupsData)

		// 로그인한 사용자인 경우에만 가입 정보 불러오기
		if (userId) {
			const { data: membershipData, error: membershipError } = await supabase
				.from('group_members')
				.select('group_id')
				.eq('user_id', userId)

			if (membershipError) {
				alert('가입 그룹 정보 불러오기 실패: ' + membershipError.message)
				setLoading(false)
				return
			}

			const joinedIdsSet = new Set(membershipData.map((m) => m.group_id))
			setJoinedGroupIds(joinedIdsSet)
		} else {
			setJoinedGroupIds(new Set())
		}

		setLoading(false)
	}

	useEffect(() => {
		fetchGroupsAndMemberships()
	}, [userId])

	const handleJoinClick = async (group) => {
		if (!userId) {
			alert('로그인이 필요합니다.')
			navigate('/login')
			return
		}
		let inputPassword = ''
		if (group.password) {
			inputPassword = prompt('비밀번호를 입력하세요')
			if (inputPassword === null) return
		}
		await joinGroup(group.id, inputPassword)
	}

	const joinGroup = async (groupId, inputPassword) => {
		if (joinedGroupIds.has(groupId)) {
			alert('이미 가입한 그룹입니다.')
			return
		}

		const { data: group, error: groupError } = await supabase
			.from('groups')
			.select('*')
			.eq('id', groupId)
			.single()


		if (group.password && group.password !== inputPassword) {
			alert('비밀번호가 올바르지 않습니다.')
			return
		}

		const { error } = await supabase.from('group_members').insert([{ group_id: groupId, user_id: userId }])
		if (error) {
			alert('가입 실패: ' + error.message)
		} else {
			alert('가입 성공!')
			setJoinedGroupIds(new Set([...joinedGroupIds, groupId]))
		}
	}

	const leaveGroup = async (groupId) => {
		if (!userId) return alert('로그인이 필요합니다.')

		// 1. 그룹 정보 조회 (owner 확인)
		const { data: group, error: groupError } = await supabase
			.from('groups')
			.select('owner')
			.eq('id', groupId)
			.single()

		if (groupError) {
			alert('그룹 정보를 불러올 수 없습니다: ' + groupError.message)
			return
		}

		// 2. 탈퇴 확인 메시지
		let confirmMessage = '탈퇴하시겠습니까?'
		if (group.owner === userId) {
			confirmMessage = '탈퇴하시겠습니까?\n\n그룹장이 탈퇴하면 그룹이 자동으로 삭제됩니다.'
		}

		if (!confirm(confirmMessage)) {
			return
		}

		// 3. owner가 탈퇴하는 경우 그룹 삭제
		if (group.owner === userId) {
			const { error: deleteError } = await supabase
				.from('groups')
				.delete()
				.eq('id', groupId)

			if (deleteError) {
				alert('그룹 삭제 실패: ' + deleteError.message)
				return
			}
			alert('그룹장이 탈퇴하여 그룹이 삭제되었습니다.')
			window.location.reload()
			return
		}

		// 4. 일반 멤버 탈퇴
		const { error: leaveError } = await supabase
			.from('group_members')
			.delete()
			.eq('group_id', groupId)
			.eq('user_id', userId)

		if (leaveError) {
			alert('탈퇴 실패: ' + leaveError.message)
		} else {
			alert('탈퇴 성공!')
			window.location.reload()
		}
	}

	const joinedGroups = groups.filter((g) => joinedGroupIds.has(g.id))

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* 헤더 */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold text-gray-900">1 Solve for 1 Day</h1>
						{session ? (
							<button
								onClick={() => {
									supabase.auth.signOut()
									window.location.reload()
								}}
								className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
							>
								로그아웃
							</button>
						) : (
							<button
								onClick={() => navigate('/login')}
								className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
							>
								로그인
							</button>
						)}
					</div>
				</div>

				{loading && <LoadingSpinner />}

				{/* 참여 중인 그룹 - 상단에 가로로 배치 */}
				{joinedGroups.length > 0 && (
					<div className="mb-8">
						<GroupSection
							title="참여 중인 그룹"
							count={joinedGroups.length}
							color="green"
							emptyMessage=""
							emptySubMessage=""
						>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
								{joinedGroups.map((group) => (
									<GroupCard
										key={group.id}
										group={group}
										isJoined={true}
										isOwner={group.owner === userId}
										onAction={() => leaveGroup(group.id)}
										actionText="탈퇴"
										actionColor="red"
									/>
								))}
							</div>
						</GroupSection>
					</div>
				)}

				{/* 그룹 생성 버튼 */}
				<div className="mb-4">
					<button
						onClick={() => {
							if (!userId) {
								alert('로그인이 필요합니다.')
								navigate('/login')
								return
							}
							navigate('/create')
						}}
						className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						그룹 생성
					</button>
				</div>

				{/* 전체 그룹 - 메인 영역 */}
				<GroupSection
					title="전체 그룹"
					count={groups.length}
					color="blue"
					emptyMessage="그룹이 없습니다."
					emptySubMessage="첫 번째 그룹을 만들어보세요!"
					rightElement={
						<input
							type="text"
							placeholder="그룹 검색"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
					}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{filteredGroups.map((group) => (
							<GroupCard
								key={group.id}
								group={group}
								isJoined={joinedGroupIds.has(group.id)}
								isOwner={group.owner === userId}
								onAction={() => handleJoinClick(group)}
								actionText="가입"
								actionColor="blue"
							/>
						))}
					</div>
				</GroupSection>
			</div>
		</div>
	)
}