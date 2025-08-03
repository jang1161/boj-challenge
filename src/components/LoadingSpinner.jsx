import React from 'react'

export default function LoadingSpinner() {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
			<div className="flex justify-center items-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<span className="ml-3 text-gray-600">로딩 중...</span>
			</div>
		</div>
	)
}