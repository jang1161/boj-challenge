// 백준 API 관련 유틸리티 함수들

// solved.ac API를 사용해서 사용자 정보 가져오기
export const fetchUserInfo = async (bojId) => {
	try {
		const response = await fetch(`https://api-py.vercel.app/?r=https://solved.ac/api/v3/user/show?handle=${bojId}`);
		if (!response.ok) {
			throw new Error('사용자를 찾을 수 없습니다.');
		}
		return await response.json();
	} catch (error) {
		console.error('백준 사용자 정보 조회 실패:', error);
		return null;
	}
};

// 사용자의 문제 해결 현황 가져오기
export const fetchUserProblems = async (bojId) => {
	try {
		const response = await fetch(`https://api-py.vercel.app/?r=https://solved.ac/api/v3/search/problem?query=solved_by:${bojId}&sort=level&direction=desc`);
		if (!response.ok) {
			throw new Error('문제 해결 현황을 가져올 수 없습니다.');
		}
		const data = await response.json();
		return data.items || [];
	} catch (error) {
		console.error('백준 문제 해결 현황 조회 실패:', error);
		return [];
	}
};

// 사용자의 통계 정보 가져오기
export const fetchUserStats = async (bojId) => {
	try {
		const response = await fetch(`https://api-py.vercel.app/?r=https://solved.ac/api/v3/user/problem_tag_stats?handle=${bojId}`);
		if (!response.ok) {
			throw new Error('통계 정보를 가져올 수 없습니다.');
		}
		return await response.json();
	} catch (error) {
		console.error('백준 통계 정보 조회 실패:', error);
		return null;
	}
};

// 레벨별 색상 매핑
export const getLevelColor = (level) => {
	const colors = {
		// 브론즈 (브라운/구리색 느낌)
		1: 'text-amber-800',   // 브론즈 5
		2: 'text-amber-800',   // 브론즈 4
		3: 'text-amber-800',   // 브론즈 3
		4: 'text-amber-800',   // 브론즈 2
		5: 'text-amber-800',   // 브론즈 1

		// 실버 (회색/은색 느낌)
		6: 'text-gray-500',    // 실버 5
		7: 'text-gray-500',    // 실버 4
		8: 'text-gray-500',    // 실버 3
		9: 'text-gray-500',    // 실버 2
		10: 'text-gray-500',   // 실버 1

		// 골드 (노란색/금색 느낌)
		11: 'text-yellow-500', // 골드 5
		12: 'text-yellow-500', // 골드 4
		13: 'text-yellow-500', // 골드 3
		14: 'text-yellow-500', // 골드 2
		15: 'text-yellow-500', // 골드 1

		// 플래티넘 
		16: 'text-emerald-300',   // 플래티넘 5
		17: 'text-emerald-300',   // 플래티넘 4
		18: 'text-emerald-300',   // 플래티넘 3
		19: 'text-emerald-300',   // 플래티넘 2
		20: 'text-emerald-300',   // 플래티넘 1

		// 다이아몬드 
		21: 'text-cyan-300',   // 다이아몬드 5
		22: 'text-cyan-300',   // 다이아몬드 4
		23: 'text-cyan-300',   // 다이아몬드 3
		24: 'text-cyan-300',   // 다이아몬드 2
		25: 'text-cyan-300',   // 다이아몬드 1

		// 루비 (빨강)
		26: 'text-rose-700',   // 루비 5
		27: 'text-rose-700',   // 루비 4
		28: 'text-rose-700',   // 루비 3
		29: 'text-rose-700',   // 루비 2
		30: 'text-rose-700',   // 루비 1
	};
	return colors[level] || 'text-gray-500';
};

// 레벨별 이름 매핑
export const getLevelName = (level) => {
	const names = {
		1: '브론즈 5', 2: '브론즈 4', 3: '브론즈 3', 4: '브론즈 2', 5: '브론즈 1',
		6: '실버 5', 7: '실버 4', 8: '실버 3', 9: '실버 2', 10: '실버 1',
		11: '골드 5', 12: '골드 4', 13: '골드 3', 14: '골드 2', 15: '골드 1',
		16: '플래티넘 5', 17: '플래티넘 4', 18: '플래티넘 3', 19: '플래티넘 2', 20: '플래티넘 1',
		21: '다이아몬드 5', 22: '다이아몬드 4', 23: '다이아몬드 3', 24: '다이아몬드 2', 25: '다이아몬드 1',
		26: '루비 5', 27: '루비 4', 28: '루비 3', 29: '루비 2', 30: '루비 1',
	};
	return names[level] || '알 수 없음';
};

// 크롤링으로 최근 푼 문제 가져오기
export const fetchRecentProblems = async (bojId, count = 10) => {
	try {
		const res = await fetch(`/api/recent-problems?user=${bojId}&count=${count}`);
		const data = await res.json();
		return data.items || [];
	} catch (error) {
		console.error("문제 불러오기 실패:", error);
		return [];
	}
};

// 오늘 푼 문제 목록 불러오기 (userId = 백준ID)
export const fetchTodaySolvedProblems = async (userId) => {
	try {
		const res = await fetch(`/api/today-problems?user=${userId}`);
		if (!res.ok) {
			throw new Error(`HTTP ${res.status}: 오늘 푼 문제를 가져오는 데 실패했습니다.`);
		}

		const data = await res.json();
		// API에서 { items: [...] } 형태로 반환하므로 items 배열만 반환
		if (data && Array.isArray(data.items)) {
			return data.items;
		} else {
			console.warn(`예상하지 못한 응답 형태 (${userId}):`, data)
			return [];
		}
	} catch (error) {
		console.error(`fetchTodaySolvedProblems 에러 (${userId}):`, error);
		throw error; // 에러를 다시 던져서 React 컴포넌트에서 catch할 수 있도록
	}
}

// 문제 ID로 난이도, 제목 가져오기
export const fetchProblemInfo = async (problemId) => {
	try {
		const response = await fetch(
			`https://api-py.vercel.app/?r=https://solved.ac/api/v3/problem/show?problemId=${problemId}`
		);
		if (!response.ok) {
			throw new Error('문제 정보를 가져올 수 없습니다.');
		}

		const data = await response.json();
		return {
			problemId: data.problemId,
			title: data.titleKo ?? '제목 없음',
			level: data.level ?? null,
		};
	} catch (error) {
		console.error(`문제 ${problemId} 정보 조회 실패:`, error);
		return {
			problemId,
			title: '제목 조회 실패',
			level: null,
		};
	}
};



