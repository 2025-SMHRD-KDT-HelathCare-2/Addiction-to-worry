/**
 * 전역 API 통신을 담당하는 핵심 HTTP 클라이언트 모듈
 * - 환경 변수(VITE_API_URL)를 활용하여 로컬 개발과 운영 배포 환경의 엔드포인트를 분리
 * - 쿠키 기반의 세션 유지를 위해 fetch API에 credentials 옵션 기본 적용
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
  // HTTP GET 메서드 공통 유틸리티
  get: async (url) => {
    const response = await fetch(`${BASE_URL}${url}`, { 
      method: 'GET', 
      credentials: 'include' 
    });
    return response.json();
  },
  
  // HTTP POST 메서드 공통 유틸리티 (JSON 직렬화 포함)
  post: async (url, body) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
  }
};