import { apiClient } from './base';

/**
 * 사용자 인증(Authentication) 및 계정 관리 API 모듈
 * - 세션 기반 인증 아키텍처 적용
 * - 백엔드 API 명세에 맞춘 엔드포인트 맵핑
 */
export const authApi = {
  /**
   * 현재 접속 중인 사용자의 세션 유효성 검증 및 정보 조회
   */
  checkSession: () => apiClient.get('/auth/session'),
  
  /**
   * 사용자 로그인 처리 (이메일/비밀번호 기반)
   */
  login: (credentials) => apiClient.post('/user/login', credentials),
  
  /**
   * 사용자 로그아웃 및 서버 세션 파기
   */
  logout: () => apiClient.post('/user/logout'),

  /**
   * 신규 회원가입 시 닉네임 중복 여부 확인
   */
  checkNickname: (nick) => apiClient.post('/auth/check-nick', { nick }),

  /**
   * 이메일 소유권 검증을 위한 6자리 인증 코드 발송
   */
  sendEmailCode: (email) => apiClient.post('/auth/send-email', { email }),

  /**
   * 수신한 이메일 인증 코드의 정합성 검증
   */
  verifyEmailCode: (email, code) => apiClient.post('/auth/verify-code', { email, code }),

  /**
   * 최종 회원가입 데이터 전송 및 신규 계정 생성
   */
  signUp: (userData) => apiClient.post('/user/join', userData),
};