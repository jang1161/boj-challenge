import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function MemberList({ members, group }) {
	const navigate = useNavigate()

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4">
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
	)
}