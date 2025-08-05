import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { fetchUserInfo, fetchRecentProblems, getLevelColor, getLevelName, fetchProblemInfo } from '../utils/bojApi'

export default function UserProfile() {
	const { userId } = useParams()
	const navigate = useNavigate()
	const [user, setUser] = useState(null)
	const [bojInfo, setBojInfo] = useState(null)
	const [recentProblems, setRecentProblems] = useState([])
	const [loading, setLoading] = useState(true)
	const [problemsLoading, setProblemsLoading] = useState(false)

	useEffect(() => {
		if (userId) {
			fetchUserProfile()
		}
	}, [userId])

	const fetchUserProfile = async () => {
		try {
			// 사용자 프로필 정보 가져오기
			const { data: profile, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single()

			if (error) {
				console.error('프로필 조회 실패:', error)
				navigate('/')
				return
			}

			setUser(profile)

			// 백준 ID가 있으면 백준 정보 가져오기
			if (profile.boj_id) {
				const bojData = await fetchUserInfo(profile.boj_id);
				setBojInfo(bojData);

				// 최근 푼 문제 가져오기
				setProblemsLoading(true);

				try {
					const problems = await fetchRecentProblems(profile.boj_id, 10);

					// 각 문제에 제목과 난이도 정보 추가
					const problemsWithInfo = await Promise.all(
						problems.map(async (problem) => {
							const info = await fetchProblemInfo(problem.problemId);
							return {
								problemId: problem.problemId,
								title: info.title,
								level: info.level,
							};
						})
					);

					setRecentProblems(problemsWithInfo);
				} catch (error) {
					console.error("문제 불러오기 실패:", error);
					setRecentProblems([]);
				}

				setProblemsLoading(false);
			}

		} catch (error) {
			console.error('사용자 정보 조회 실패:', error)
			navigate('/')
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="text-gray-600 mt-4">사용자 정보를 불러오는 중...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">사용자를 찾을 수 없습니다.</p>
					<button
						onClick={() => navigate('/')}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						홈으로 돌아가기
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* 뒤로가기 버튼 */}
				<button
					onClick={() => navigate(-1)}
					className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
				>
					<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					뒤로가기
				</button>

				{/* 사용자 정보 + 백준 정보  */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
					<div className="flex items-center gap-4 mb-4">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
							<span className="text-blue-800 font-semibold text-2xl">
								{user.nickname?.charAt(0).toUpperCase() || '?'}
							</span>
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-gray-900">{user.nickname}</h1>
							<p className="text-gray-600">
								백준 ID: {user.boj_id}
								<a
									href={`https://www.acmicpc.net/user/${user.boj_id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 ml-2 hover:text-blue-800 text-sm"
								>
									[백준 페이지]
								</a>
							</p>
						</div>
					</div>

					{bojInfo && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-gray-50 rounded-lg p-4">
								<p className="text-sm text-gray-600 mb-1">티어</p>
								<p className={`text-lg font-semibold ${getLevelColor(bojInfo.tier)}`}>
									{getLevelName(bojInfo.tier)}
								</p>
							</div>
							<div className="bg-gray-50 rounded-lg p-4">
								<p className="text-sm text-gray-600 mb-1">해결한 문제</p>
								<p className="text-lg font-semibold text-green-600">{bojInfo.solvedCount}문제</p>
							</div>
							{bojInfo.rating > 0 && (
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-600 mb-1">레이팅</p>
									<p className="text-lg font-semibold text-purple-600">{bojInfo.rating}</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* 최근 푼 문제 */}
				{user.boj_id && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">최근 푼 10문제</h2>
						{problemsLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								<p className="text-sm text-gray-600 mt-2">최근 문제를 불러오는 중...</p>
							</div>
						) : recentProblems.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{recentProblems.map((item, index) => (
									<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
						) : (
							<div className="text-center py-8">
								<p className="text-gray-600">최근 푼 문제가 없습니다.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
} 