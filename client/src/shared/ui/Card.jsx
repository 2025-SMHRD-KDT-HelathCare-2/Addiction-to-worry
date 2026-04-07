import React from 'react';

/**
 * 공통 Card UI 컴포넌트
 * - 애플리케이션 전반에서 사용되는 컨테이너의 일관된 그림자, 테두리, 배경 스타일 제공
 * - 외부에서 className 속성을 주입하여 유연한 레이아웃 확장 가능
 */
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}