// components/RecentProblems.jsx

import React from 'react'
import { getLevelColor, getLevelName } from '../utils/bojApi'

export default function RecentProblems({ problems, loading }) {
	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p className="text-sm text-gray-600 mt-2">최근 문제를 불러오는 중...</p>
			</div>
		)
	}

	if (problems.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600">최근 푼 문제가 없습니다.</p>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{problems.map((item, index) => (
				<div
					key={index}
					onClick={() => window.open(`https://www.acmicpc.net/problem/${item.problemId}`, '_blank')}
					className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
				>
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-500">#{item.problemId}</span>
						<div>
							<p className="font-medium text-gray-900">{item.title}</p>
						</div>
					</div>
					<span className={`text-sm font-medium ${getLevelColor(item.level)}`}>
						{getLevelName(item.level)}
					</span>
				</div>
			))}
		</div>
	)
}
