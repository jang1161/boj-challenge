import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ManageProfile() {
	const [user, setUser] = useState(null)
	const [file, setFile] = useState(null)
	const [nickname, setNickname] = useState('')
	const [saving, setSaving] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		supabase.auth.getUser().then(async ({ data: { user } }) => {
			if (user) {
				setUser(user)

				// 닉네임 불러오기
				const { data, error } = await supabase
					.from('profiles')
					.select('nickname, avatar_url')
					.eq('id', user.id)
					.single()

				if (!error && data) {
					setNickname(data.nickname || '')
					setUser((prev) => ({ ...prev, avatar_url: data.avatar_url }))
				}
			} else {
				navigate('/login')
			}
		})
	}, [])

	const handleUpload = async () => {
		if (!file || !user) return

		const fileExt = file.name.split('.').pop()
		const filePath = `${user.id}/avatar.${fileExt}`

		const { error: uploadError } = await supabase.storage
			.from('avatars')
			.upload(filePath, file, { upsert: true })

		if (uploadError) {
			alert('업로드 실패: ' + uploadError.message)
			return
		}

		const { data: publicUrlData } = supabase
			.storage
			.from('avatars')
			.getPublicUrl(filePath)

		await supabase
			.from('profiles')
			.update({ avatar_url: publicUrlData.publicUrl })
			.eq('id', user.id)

		// 업데이트된 avatar_url을 상태에도 반영
		setUser((prev) => ({ ...prev, avatar_url: publicUrlData.publicUrl }))

		alert('프로필 이미지가 업데이트되었습니다.')
	}

	const handleDeleteAvatar = async () => {
		if (!user) return
		const filePath = user.avatar_url?.split('/').slice(-2).join('/') // 'userId/avatar.ext'

		const { error: removeError } = await supabase.storage
			.from('avatars')
			.remove([filePath])

		if (removeError) {
			alert('삭제 실패: ' + removeError.message)
			return
		}

		const { error: updateError } = await supabase
			.from('profiles')
			.update({ avatar_url: null })
			.eq('id', user.id)

		if (updateError) {
			alert('프로필 정보 업데이트 실패: ' + updateError.message)
			return
		}

		setUser({ ...user, avatar_url: null })
		alert('프로필 이미지가 삭제되었습니다.')
	}


	const handleSaveNickname = async () => {
		if (!user) return

		const trimmed = nickname.trim()

		// 유효성 검사
		const isValid = /^[a-zA-Z0-9가-힣]{2,8}$/.test(trimmed)
		if (!isValid) {
			alert('닉네임은 2~8자의 한글, 영어, 숫자만 사용할 수 있으며, 공백이나 기호는 허용되지 않습니다.')
			return
		}

		setSaving(true)

		// 닉네임 중복 확인
		const { data: existing, error: checkError } = await supabase
			.from('profiles')
			.select('id')
			.eq('nickname', trimmed)
			.neq('id', user.id)
			.maybeSingle()

		if (checkError) {
			alert('닉네임 중복 확인 중 오류 발생: ' + checkError.message)
			setSaving(false)
			return
		}

		if (existing) {
			alert('이미 사용 중인 닉네임입니다.')
			setSaving(false)
			return
		}

		// 닉네임 저장
		const { error } = await supabase
			.from('profiles')
			.update({ nickname: trimmed })
			.eq('id', user.id)

		if (error) {
			alert('닉네임 저장 실패: ' + error.message)
		} else {
			alert('닉네임이 저장되었습니다.')
		}

		setSaving(false)
	}

	const handleLogout = async () => {
		await supabase.auth.signOut()
		navigate('/')
	}

	const handleDeleteAccount = async () => {
		if (!confirm('정말 탈퇴하시겠습니까?')) return

		const { error } = await supabase.from('profiles').delete().eq('id', user.id)
		if (error) {
			alert('탈퇴 실패: ' + error.message)
			return
		}

		await supabase.auth.signOut()
		alert('탈퇴가 완료되었습니다.')
		navigate('/')
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md">
				{/* 뒤로가기 */}
				<button
					onClick={() => navigate(-1)}
					className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
				>
					<svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					뒤로 가기
				</button>

				<div className="bg-white border rounded-lg shadow-md p-6">
					<h2 className="text-2xl font-bold mb-4 text-center">프로필 설정</h2>

					{/* 프로필 이미지 및 업로드 */}
					<div className="mb-6 flex flex-col items-center gap-4">
						{user?.avatar_url ? (
							<img
								src={user.avatar_url}
								alt="프로필 이미지"
								className="w-48 h-48 rounded-full object-cover border border-gray-300"
							/>
						) : (
							<div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center">
								<span className="text-blue-800 font-semibold text-5xl">
									{nickname?.charAt(0).toUpperCase() || '?'}
								</span>
							</div>
						)}

						<div className="w-full">
							<label className="block text-sm font-medium text-gray-700 mb-1">프로필 이미지 업로드</label>
							<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
							<div className="flex gap-2 mt-2">
								<button
									onClick={handleUpload}
									className="flex-1 text-sm px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-500"
								>
									업로드
								</button>
								{user?.avatar_url && (
									<button
										onClick={handleDeleteAvatar}
										className="text-sm px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
									>
										삭제
									</button>
								)}
							</div>
						</div>
					</div>

					{/* 닉네임 수정 */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
						<div className="flex gap-2 items-center">
							<input
								type="text"
								value={nickname}
								onChange={(e) => setNickname(e.target.value)}
								className="flex-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
							/>
							<button
								onClick={handleSaveNickname}
								disabled={saving}
								className="text-sm px-3 py-1.5 bg-sky-500 text-white rounded-md hover:bg-sky-500 disabled:opacity-50"
							>
								{saving ? '저장 중' : '저장'}
							</button>
						</div>
					</div>

					<hr className="my-4" />

					<div className="flex flex-col gap-2">
						<button
							onClick={handleLogout}
							className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
						>
							로그아웃
						</button>
						<button
							onClick={handleDeleteAccount}
							className="w-full bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200"
						>
							회원 탈퇴
						</button>
					</div>
				</div>
			</div>
		</div>
	)

}
