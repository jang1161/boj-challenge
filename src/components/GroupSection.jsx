// components/GroupSection.jsx
import React from 'react'

export default function GroupSection({ title, count, color, emptyMessage, emptySubMessage, children }) {
	const getColorClasses = (color) => {
		const colors = {
			green: {
				dot: 'bg-green-500',
				badge: 'bg-green-100 text-green-800'
			},
			blue: {
				dot: 'bg-blue-500', 
				badge: 'bg-blue-100 text-blue-800'
			}
		}
		return colors[color] || colors.blue
	}

	const colorClasses = getColorClasses(color)

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200">
			<div className="p-6 border-b border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
					<div className={`w-3 h-3 rounded-full ${colorClasses.dot}`}></div>
					{title}
					<span className={`text-sm font-medium px-2 py-1 rounded-full ${colorClasses.badge}`}>
						{count}
					</span>
				</h2>
			</div>
			<div className="p-6">
				{React.Children.count(children) === 0 ? (
					<div className="text-center py-8">
						<div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<p className="text-gray-500 text-sm">{emptyMessage}</p>
						<p className="text-gray-400 text-xs mt-1">{emptySubMessage}</p>
					</div>
				) : (
					<div className="space-y-3">
						{children}
					</div>
				)}
			</div>
		</div>
	)
}