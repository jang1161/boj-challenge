import React from 'react'

export default function GroupInfo({ group, members, owner }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">그룹원 수</span>
          <p className="font-medium">{members.length}명</p>
        </div>
        <div>
          <span className="text-gray-600">비밀번호</span>
          {group.password ? (
            <p className="font-medium">설정됨</p>) 
            : (<p className="font-medium">설정 안 됨</p>
          )}
        </div>
        <div>
          <span className="text-gray-600">쉬는 요일</span>
          <p className="font-medium">
            {group.rest_days && group.rest_days.length > 0
              ? group.rest_days.join(', ')
              : '쉬긴 뭘 쉬어ㅋㅋ'}
          </p>
        </div>
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
