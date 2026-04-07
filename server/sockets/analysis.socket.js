// 실시간 분석에 필요한 서비스 및 설정 모듈 import
// analysis.service: 스트림 데이터 검증, 자세 분석, 결과 생성
// SOCKET_EVENTS: 클라이언트와 통신할 이벤트 이름 정의
// GOOD_POSTURE_STATUS: 좋은 자세 판별 기준
// pose/noise.service: DB 저장 로직
// SOCKET_INTERVALS: 분석 및 저장 주기 설정

const {
  validateStreamData,
  analyzeStreamFrame,
  getBufferedFinalPosture,
  buildAnalysisResponse,
} = require('../services/analysis.service');

const { SOCKET_EVENTS } = require('../../shared/constants/socket-events');
const { GOOD_POSTURE_STATUS } = require('../../shared/constants/posture');
const { savePoseIfChanged } = require('../services/pose.service');
const { saveNoiseIfNeeded } = require('../services/noise.service');
const { SOCKET_INTERVALS } = require('../utils/mappers');

// 소켓 연결 시 사용자별 상태를 초기화하는 함수
// 각 사용자마다 별도의 상태를 유지하기 위해 사용

function createInitialSocketState() {
  return {
    lastSavedPostureStatus: null,// lastSavedPostureStatus: 마지막으로 DB에 저장된 자세 상태
    postureBuffer: [], // postureBuffer: 일정 시간 동안 쌓은 자세 데이터 (노이즈 제거용)
    lastDispatchAtMs: 0, // lastDispatchAtMs: 마지막 분석 결과 전송 시점
    lastNoiseSavedAtMs: 0, // lastNoiseSavedAtMs: 마지막 소음 저장 시점
    isProcessing: false, // isProcessing: 중복 처리 방지 플래그
    currentScore: 100, // currentScore: 실시간 집중 점수 (누적 방식)
    staticState: { // staticState: 정적 자세 감지를 위한 상태 저장
      lastNosePos: null,
      staticCheckStart: Date.now(),
    },
  };
}

// 클라이언트가 소켓 연결을 시작하면 실행되는 영역
// 사용자별 실시간 분석 세션 시작

function registerAnalysisSocket(io) {
  io.on('connection', (socket) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('클라이언트 연결됨:', socket.id);
    }

// 해당 클라이언트 전용 상태 객체 생성
// 점수, 버퍼, 시간 등을 이 객체에 저장

    const socketState = createInitialSocketState();

// 클라이언트에게 분석 엔진 준비 완료 신호 전송

    socket.emit(SOCKET_EVENTS.ENGINE_READY, {
      status: 'READY',
      message: 'AI 분석 엔진 가동 시작',
    });

// 클라이언트에서 실시간으로 보내는 데이터 처리
// (카메라 자세, 소음 등)

    socket.on(SOCKET_EVENTS.STREAM_DATA, async (streamData) => {
      // 이전 프레임 처리 중이면 새 데이터는 무시
      // 서버 과부하 및 중복 처리 방지
      if (socketState.isProcessing) {
        return;
      }

      socketState.isProcessing = true;

      try {
        // 클라이언트에서 받은 데이터 유효성 검사
        // 잘못된 데이터는 분석하지 않음
        const validationResult = validateStreamData(streamData);

        if (!validationResult.isValid) {
          socket.emit(SOCKET_EVENTS.ANALYSIS_RESULT, {
            status: 'INVALID_INPUT',
            message: validationResult.message,
          });
          return;
        }

        const {
          noise_db: noiseLevelDb,
          imm_idx: immersionId,
        } = streamData;

        if (!immersionId && process.env.NODE_ENV !== 'production') {
          console.warn('[STREAM WARNING] immersionId 없이 분석 결과만 처리 중');
        }

// 현재 프레임을 기반으로 자세 및 상태 분석 수행

        const analysisResult = analyzeStreamFrame(streamData, socketState);

// 사용자가 감지되지 않으면 분석 중단
// (카메라 밖, 얼굴 미인식 등)

        if (!analysisResult.isUserDetected) {
          socket.emit(SOCKET_EVENTS.ANALYSIS_RESULT, analysisResult.error);
          return;
        }

        const { currentPosture, cameraMode, noiseStatus } = analysisResult;

        // 프레임 단위 자세를 버퍼에 저장
        // 일정 시간 동안 모아서 최종 자세 판단
        socketState.postureBuffer.push(currentPosture);

        const currentTimestampMs = Date.now();
        const elapsedMs = currentTimestampMs - socketState.lastDispatchAtMs;

        // 너무 자주 분석 결과를 보내지 않도록 제한
        // 일정 시간 간격으로만 처리
        if (elapsedMs < SOCKET_INTERVALS.ANALYSIS_DISPATCH_MS) {
          return;
        }

        if (socketState.postureBuffer.length === 0) {
          return;
        }

        // 버퍼에 쌓인 데이터를 기반으로 최종 자세 결정
        // 노이즈 제거 및 안정화 목적
        const finalPosture = getBufferedFinalPosture(socketState.postureBuffer);

        // 실시간 집중 점수 계산 (누적 방식)
        // 좋은 자세면 점수 증가, 나쁜 자세면 점수 감소
        // Math.min / Math.max로 점수 범위를 0~100으로 제한
            if (GOOD_POSTURE_STATUS.includes(finalPosture)) {
              socketState.currentScore = Math.min(100, socketState.currentScore + 1);
              } else {
                socketState.currentScore = Math.max(0, socketState.currentScore - 3);
                }

                // 다음 분석을 위해 버퍼 초기화
        socketState.postureBuffer.length = 0;
        socketState.lastDispatchAtMs = currentTimestampMs;

        // 자세와 소음 데이터를 DB에 저장 (병렬 처리)
// 하나 실패해도 전체 로직이 중단되지 않도록 allSettled 사용
        const [poseResult, noiseResult] = await Promise.allSettled([
          savePoseIfChanged({
            immersionId,
            finalPosture,
            lastSavedPostureStatus: socketState.lastSavedPostureStatus,
          }),
          saveNoiseIfNeeded({
            immersionId,
            noiseLevelDb,
            currentTimestampMs,
            lastNoiseSavedAtMs: socketState.lastNoiseSavedAtMs,
            noiseSaveIntervalMs: SOCKET_INTERVALS.NOISE_SAVE_MS,
          }),
        ]);

        // 저장 성공 시 상태 업데이트
        // 실패 시 로그 출력
        if (poseResult.status === 'fulfilled') {
          socketState.lastSavedPostureStatus = poseResult.value.nextSavedStatus;
        } else {
          console.error('[POSE SAVE ERROR]', poseResult.reason);
        }

        if (noiseResult.status === 'fulfilled') {
          socketState.lastNoiseSavedAtMs = noiseResult.value.nextNoiseSavedAtMs;
        } else {
          console.error('[NOISE SAVE ERROR]', noiseResult.reason);
        }

// 분석 결과를 클라이언트로 보낼 형태로 변환
// 점수, 자세, 소음 상태 포함
        const responsePayload = buildAnalysisResponse({
          cameraMode,
          noiseStatus,
          finalPosture,
          currentScore: socketState.currentScore,
        });

        // 클라이언트로 실시간 분석 결과 전송
        socket.emit(SOCKET_EVENTS.ANALYSIS_RESULT, responsePayload);

        // 스트림 처리 중 발생한 에러 처리
        // 클라이언트에도 에러 상태 전달
      } catch (error) {
        console.error('[STREAM PROCESS ERROR]', error);
        socket.emit(SOCKET_EVENTS.ANALYSIS_RESULT, {
          status: 'ERROR',
          message: '스트림 데이터 처리 중 오류가 발생했습니다.',
        });

        // 처리 종료 후 상태 초기화
// 다음 프레임 처리를 위해 isProcessing 해제
      } finally {
        socketState.isProcessing = false;
      }
    });

    // 클라이언트 연결 종료 시 실행
// 상태 초기화 및 메모리 정리
    socket.on('disconnect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('클라이언트 연결 종료:', socket.id);
      }

      socketState.postureBuffer.length = 0;
      socketState.staticState.lastNosePos = null;
      socketState.staticState.staticCheckStart = Date.now();
    });
  });
}

module.exports = registerAnalysisSocket;