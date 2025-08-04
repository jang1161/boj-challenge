import React from 'react'

export default function GroupInfo({ group, members, owner }) {
	return (
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
	)
}