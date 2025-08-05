import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function GroupCard({ group, isJoined, isOwner, onAction, actionText, actionColor }) {
	const navigate = useNavigate()
	const getColorClasses = (color, variant = 'button') => {
		const colors = {
			red: {
				button: 'bg-red-100 hover:bg-red-200 text-red-700',
				card: 'bg-green-50 border-green-200',
				icon: 'bg-green-500'
			},
			blue: {
				button: 'bg-blue-600 hover:bg-blue-700 text-white',
				card: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
				icon: 'bg-gray-400'
			},
			green: {
				button: 'bg-green-100 hover:bg-green-200 text-green-700',
				card: 'bg-green-50 border-green-200',
				icon: 'bg-green-500'
			}
		}
		return colors[color]?.[variant] || colors.blue[variant]
	}

	const cardColor = isJoined ? 'green' : 'blue'
	const iconColor = isJoined ? 'green' : 'blue'

	return (
		<div
			className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${getColorClasses(cardColor, 'card')} cursor-pointer hover:shadow-md`}
			onClick={() => navigate(`/groups/${group.id}`)}
		>
			<div className="flex items-center gap-3">
				<div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(iconColor, 'icon')}`}>
					<span className="text-white font-semibold text-sm">
						{group.name.charAt(0).toUpperCase()}
					</span>
				</div>
				<div>
					<div className="flex items-center gap-2">
						<h3 className="font-medium text-gray-900">{group.name}</h3>
						{isOwner && (
							<span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
								그룹장
							</span>
						)}
					</div>
					{/* 그룹 설명 */}
					{group.description && (
						<p className="text-sm text-gray-600">{group.description}</p>
					)}
					{/* 참여자 수 */}
					<p className="text-xs text-gray-500 mt-1">
						{group.member_count}명 참여 중
					</p>

				</div>
			</div>

			{/* 버튼 또는 상태 뱃지 */}
			{isJoined && actionText === '탈퇴' ? (
				<button
					onClick={(e) => {
						e.stopPropagation()
						onAction()
					}}
					className={`font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm ${getColorClasses(actionColor, 'button')}`}
				>
					{actionText}
				</button>
			) : isJoined ? (
				<span className="bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg text-sm">
					참여 중
				</span>
			) : (
				<button
					onClick={(e) => {
						e.stopPropagation()
						onAction()
					}}
					className={`font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm ${getColorClasses(actionColor, 'button')}`}
				>
					{actionText}
				</button>
			)}
		</div>
	)
}