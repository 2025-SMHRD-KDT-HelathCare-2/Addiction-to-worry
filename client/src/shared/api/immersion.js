import { apiClient } from './base';

/**
 * 집중 세션(Immersion) 측정 및 결과 데이터 연동 API 모듈
 */
export const immersionApi = {
  // 측정 시작 시 DB 세션 생성 및 고유 식별자(imm_idx) 발급
  start: (user_idx) => apiClient.post('/api/immersion/start', { user_idx }),
  // 측정 종료 시 산출된 최종 집중도 데이터 및 AI 피드백 생성 요청
  end: (data) => apiClient.post('/api/immersion/end', data),
  // 특정 세션의 상세 분석 리포트 데이터 조회 (자세 로그, 소음 트렌드 등)
  getReportDetail: (imm_idx) => apiClient.get(`/api/immersion/report/${imm_idx}`),
  // 사용자의 과거 집중 세션 전체 히스토리 목록 조회
  getHistory: (user_idx) => apiClient.get(`/api/mypage/history/${user_idx}`),
  // 누적 포인트, 달성률 등 마이페이지용 종합 통계 데이터 조회
  getStats: (user_idx) => apiClient.get(`/api/mypage/stats/${user_idx}`),
  
  // 목표 포인트 도달 시 뱃지 획득(DB 반영) 처리
  purchaseBadge: (user_idx, badge_id) => apiClient.post('/api/mypage/badge/purchase', { user_idx, badge_id }),
};