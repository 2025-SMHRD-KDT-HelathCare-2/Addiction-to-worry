import React from 'react';
/* FSD 계층 구조에 맞게 shared/ui 폴더의 컴포넌트들을 참조하도록 경로를 수정했습니다. */
import Card from '../shared/ui/Card';
import Logo from '../shared/ui/Logo';

/**
 * 인증 및 계정 관리 페이지(로그인, 회원가입 등)의 공통 레이아웃 컴포넌트
 * - FSD (Feature-Sliced Design) 아키텍처를 준수하여 shared UI 자산을 조립
 * - 페이지 간 일관된 여백, 배경 효과, 컨테이너 너비 제약 등 공통 스타일 강제
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    // 화면 중앙 정렬 및 진입 애니메이션이 적용된 최상위 래퍼
    <div className="flex items-center justify-center min-h-[85vh] animate-fade-in py-10">
      {/* 내부 콘텐츠를 감싸는 공용 Card 컨테이너 */}
      <Card className="max-w-md w-full p-10 border-none shadow-2xl rounded-[2.5rem]">
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo isDarkBg={false} />
          <h2 className="text-2xl font-black text-slate-900 mt-8 tracking-tight">{title}</h2>
          <p className="text-slate-500 mt-2 font-medium text-sm">{subtitle}</p>
        </div>
        {/* 로그인 폼, 회원가입 폼 등 동적으로 주입되는 자식 컴포넌트 렌더링 영역 */}
        {children}
      </Card>
    </div>
  );
}