// 실시간 분석에 필요한 핵심 로직 import
// analysis_engine: 자세, 소음, 카메라 상태를 분석하는 AI 로직
// mappers: 점수 계산 및 상태 매핑 관련 함수
// posture constants: 자세 상태 정의 값
const {
  detect_camera_mode,
  analyze_noise_level,
  check_user_presence,
  analyze_posture,
  get_coaching_message,
} = require('../utils/analysis_engine');

const { getDisplayScore } = require('../utils/mappers');
const { POSTURE_STATUS } = require('../../shared/constants/posture');

// 클라이언트에서 전달된 스트림 데이터의 유효성을 검사하는 함수
// 잘못된 데이터는 이후 분석 단계로 넘어가지 않도록 차단
function validateStreamData(streamData) {
  // streamData가 객체 형태인지 확인
  if (!streamData || typeof streamData !== 'object') {
    return {
      isValid: false,
      message: 'stream_data 형식이 올바르지 않습니다.',
    };
  }

  const { landmarks, noise_db: noiseLevelDb } = streamData;
// 카메라에서 추출된 랜드마크 데이터가 정상인지 확인
  if (!Array.isArray(landmarks) || landmarks.length === 0) {
    return {
      isValid: false,
      message: 'landmarks 데이터가 올바르지 않습니다.',
    };
  }
// 소음 값이 숫자인지 검증
  if (noiseLevelDb !== undefined && typeof noiseLevelDb !== 'number') {
    return {
      isValid: false,
      message: 'noise_db 값이 올바르지 않습니다.',
    };
  }

  return {
    isValid: true,
    message: 'OK',
  };
}
// 한 프레임 단위로 사용자 상태를 분석하는 핵심 함수
// 자세, 소음, 카메라 상태를 종합적으로 판단
function analyzeStreamFrame(streamData, socketState) {
  const {
    landmarks,
    noise_db: noiseLevelDb,
    calibration,
    faceLandmarks,
  } = streamData;

  // 사용자(얼굴/몸)가 감지되지 않으면 분석 중단
// 카메라 밖 상황 처리
  if (!check_user_presence(landmarks)) {
    return {
      isUserDetected: false,
      cameraMode: null,
      noiseStatus: null,
      currentPosture: null,
      error: {
        status: 'USER_NOT_FOUND',
        message: '사용자를 찾는 중입니다...',
      },
    };
  }

  const cameraMode = detect_camera_mode(landmarks); // 카메라 위치/각도 상태 분석
  const noiseStatus = analyze_noise_level(noiseLevelDb); // 주변 소음 상태를 분석 (조용함 / 시끄러움 등)
  const currentPosture = analyze_posture( // 현재 자세 상태 분석 (거북목, 정상, 기울어짐 등)
                                          // staticState를 이용해 정적인 자세도 함께 판단
    landmarks,
    cameraMode,
    calibration,
    faceLandmarks,
    socketState.staticState
  );

  return {
    isUserDetected: true,
    cameraMode,
    noiseStatus,
    currentPosture,
    error: null,
  };
}

// 일정 시간 동안 수집된 자세 데이터를 기반으로 최종 자세를 결정
// 노이즈 제거 및 안정적인 판단을 위한 버퍼 처리 로직
function getBufferedFinalPosture(postureBuffer) {
  // 버퍼가 비어있으면 기본값(좋은 자세) 반환
  if (!Array.isArray(postureBuffer) || postureBuffer.length === 0) {
    return POSTURE_STATUS.GOOD_POSTURE;
  }
// 각 자세 상태별 등장 횟수를 카운팅하기 위한 객체
  const postureCounts = {};
// 버퍼에 저장된 자세들을 순회하면서 빈도 계산
  for (const posture of postureBuffer) {
    postureCounts[posture] = (postureCounts[posture] || 0) + 1;
  }

  let finalPosture = 'GOOD_POSTURE';
  let maxCount = 0;
// 가장 많이 등장한 자세를 최종 자세로 선택
// (최빈값 방식)
  for (const [posture, count] of Object.entries(postureCounts)) {
    if (count > maxCount) {
      maxCount = count;
      finalPosture = posture;
    }
  }

  return finalPosture;
}
// 분석 결과를 클라이언트에 전달할 형태로 구성하는 함수
// socket에서 계산된 점수를 그대로 전달 (중요)
function buildAnalysisResponse({ cameraMode, noiseStatus, finalPosture, currentScore }) {
  // 현재 자세와 소음 상태를 기반으로 사용자에게 보여줄 피드백 메시지 생성
  const coachingMessage = get_coaching_message(finalPosture, noiseStatus);
// 클라이언트로 전달되는 최종 응답 객체
// camera_mode, posture_status, current_score 등 포함
  return {
    status: 'SUCCESS',
    camera_mode: cameraMode,
    noise_status: noiseStatus,
    posture_status: finalPosture,
    current_score: currentScore,
    message: coachingMessage,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  validateStreamData,
  analyzeStreamFrame,
  getBufferedFinalPosture,
  buildAnalysisResponse,
};