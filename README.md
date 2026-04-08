GitHub에 README 작성
실제 예시는 아래 토글 참고하기!

1. 프로젝트명(팀명:고민중독)
  MediaPipe 기반 실시간 
  소음·자세 분석 집중 환경 케어 플랫폼

2. 서비스소개
  헬스케어 / 집중력 및 생산성 관리 서비스

3. 프로젝트기간
  2026-02-28 ~ 2026-04-08

4. 주요기능
  - 자세 분석 기능
  - AI 코칭 피드백 기능
  - 회원 가입 및 로그인 기능
  - 소셜 로그인 기능
  - 게임화 기능(포인트, 뱃지)
  - 데이터 저장, 조회 기능(MySQL)

5. 기술스택
  - MediaPipe, Gemini API 연동, SocketIO, Node.js, Express, Web Audio API, Chart.js

6. 시스템 아키텍처
  - 

7. 유스케이스
  - 

8. 서비스 흐름도
  -

9. ER 다이어그램
  -

10 .화면구성
  -

11. 팀원역할
  - 주양덕(PM, DataBase 보조)
    일정 관리, 문서 작업, 발표
  - 신예은(Backend_Data Modeling)
    MediaPipe 자세 분석 활용 자세 판단 알고리즘, Gemini API 연동 및 AI feedback 프롬프트 구현, 마이페이지 뱃지, 포인트 기능 구현, DB 기능 추가 및 수정 보조
  - 조성현(Frontend)
    React, Mediapipe, SocketIO를 활용한 인트로, 회원가입, 로그인, 대시보드, 보고서 페이지, 마이페이지, 화면 디자인 등등 프론트엔드의 전반적인 개발
  - 오철승(Backend)  
    Node.js, Express, SocketIO 등을 활용하여 백엔드의 전체적인 틀을 구현하였으며, 로그인, 소셜 로그인 기능, 회원가입, 대쉬보드 페이지 개발
  - 전현경(DB) 
    DB 구축 및 설계, DB 암호화 구현, DB 쿼리 생성, 프론트엔드 디자인 보조 및 테스터를 담당하였습니다."

12. 트러블슈팅
- 신예은(Backend_Data Modeling)
  - [1] 정면 거북목 오판정 문제
    문제: 단순 목-어깨 수직 거리 변화량만으로 판정하다 보니 목을 앞으로 내미는 동작을 제대로 감지하지 못해 주의,경고가 거의 발생하지 않음
    기존 방식: 목과 어깨의 단순 수직 거리 변화량만 측정
    해결: 목을 앞으로 내밀면 얼굴이 카메라와 가까워져 화면상 귀 사이 거리가 멀어지는 원근법 원리 활용, 고정 수치 대신 어깨 너비 대비 귀 거리의 상대적 비율(Ratio)로 판정하여 체형/카메라 거리와 무관하게 감지

  - [2] 거북목/엎드림 오판정 문제
    문제: 거북목(고개를 앞으로 내미는 자세)과 엎드림(고개를 아래로 숙이는 자세)은 실제로 다른 자세지만, 2D 카메라 좌표상에서는 유사한 변화를 보여 오판정이 자주 발생함
    기존 방식: 거북목과 엎드림을 별도로 구분하는 로직 없이 단순 좌표 변화만으로 판정
    해결: 코의 Y축 좌표가 정자세 대비 40px 이상 아래로 내려가면 거북목이 아닌 엎드림으로 판단하는 Y축 하락 기준선 로직 추가, 두 자세를 명확히 분리하여 정확한 코칭 메시지 전달

  - [3] 부동 자세 판정 시 다른 나쁜 자세 감지 불가 문제
    문제: 부동 자세 판정 시 함수가 즉시 종료되어 동시에 발생한 턱 괴기 등 다른 나쁜 자세를 감지하지 못함
    기존 방식: 부동 자세 감지 시 즉시 return하여 함수 종료
    해결: 즉시 return 대신 currentStaticAlert 변수에 저장 후 세부 자세 로직을 계속 수행, 마지막에 최종 반환하는 비차단 구조로 변경

  - 오철승(Backend)
  [1] 소셜 로그인 API 오류 문제
문제: 소셜 로그인 진행 시 인증이 실패하거나 콜백 이후 정상 로그인 처리가 되지 않음
원인: 디벨로퍼 콘솔에서 시크릿 키 설정과 콜백 URL이 서버 설정과 일치하지 않아 인증 흐름이 깨짐
해결: 디벨로퍼 공식 문서를 참고해 시크릿 키와 콜백 주소를 정확히 맞추고, 환경변수와 서버 설정을 통일하여 정상 동작하도록 수정

  [2]  실시간 점수가 고정값처럼 보이던 문제
문제: 자세 상태는 변하지만 점수는 100/40처럼 고정값으로만 반응
원인: 매 프레임마다 현재 자세 기준으로 점수를 새로 계산하는 구조
해결: socket에 currentScore 상태 추가 후, 자세에 따라 누적 증감 방식으로 변경

  [3]  AI 피드백이 fallback만 내려오던 문제
문제: 리포트 API에서 ai_feedback이 항상 fallback 응답으로 반환됨
원인: (1) 환경변수 API 키 불일치로 AI 호출이 실패하고 fallback 처리됨
      (2) 정상 응답 이후에도 코드블록(JSON) 형태로 반환되어 파싱 실패 발생
해결: API 키 변수 통일 및 모델 설정 수정, 응답에서 코드블록 제거 후 JSON.parse 처리로 정상 파싱

- 조성현(Frontend)
  - [1] 실시간 데이터 스트리밍 누락(Closure Trap) 문제
    문제: 측정 시작 후 UI 타이머는 정상 작동하나 실시간 점수 및 집중도 데이터가 업데이트되지 않고 고정되는 현상 발생
    원인: MediaPipe 비동기 콜백 함수가 렌더링 초기 상태(isFocusing: false)만 기억하는 리액트 클로저 트랩(Closure Trap) 발생
    해결: 렌더링 주기와 무관하게 항상 최신 값을 유지하는 useRef(isFocusingRef)를 도입하여 콜백 내부에서 최신 상태를 참조하도록 수정
    ```javascript
    // [Problem] 클로저 트랩으로 인해 초기 상태값(false)에 갇힘
    pose.onResults((res) => {
      if (isFocusing) { // 항상 false로 인식되어 실행되지 않음
        socketRef.current.emit('stream_data', { ... });
      }
    });

    // [Solution] useRef를 사용하여 렌더링과 독립적인 최신 참조값 확보
    const isFocusingRef = useRef(false);
    pose.onResults((res) => {
      if (isFocusingRef.current) { // 최신 상태를 실시간으로 인지
        socketRef.current.emit('stream_data', { ... });
      }
    });
    ```

  - [2] 영점 조절(Calibration) 시 사용자 인지 오류 및 UI 시프트 문제
    문제: 영점 조절 시 카메라 화면이 켜지지 않은 상태에서 카운트다운만 노출되어 정확한 자세 설정이 어렵고 측정 시작 시 화면 깜빡임 발생
    원인: '측정 시작' 클릭 시점에 카메라를 구동하는 수동적 설계로 인해 흐름이 부자연스러움
    해결: 영점 조절 클릭 시 카메라를 선행 구동하고, 측정 시작 시 재구동 없이 세션만 전환하는 심리스(Seamless) UX 구현
    ```javascript
    // 영점 조절 시 카메라와 AI 모델을 먼저 활성화하여 시각적 피드백 제공
    const handleCalibrationRequest = async () => {
      if (cameraState === 'OFF') {
        await startCamera(); // 카메라 선행 구동
        setCameraState('ON');
      }
      startCountdown(); // 이후 카운트다운 진행
    };
    ```

  - [3] 회원가입 이메일 중복 시 무반응(Silent Failure) 및 입력 불편 문제
    문제: 이미 가입된 이메일 사용 시 에러 알림이 없어 화면이 멈춘 것처럼 보이고, 매번 도메인을 수동 타이핑해야 함
    원인: API 통신 예외 처리에 대한 UI 피드백 누락 및 입력 보조 기능 부재
    해결: try-catch 기반 에러 핸들링 및 키보드 네비게이션이 가능한 자동완성 드롭다운 구현
    ```javascript
    // 예외 상황에 대한 명확한 Alert 피드백과 로딩 스피너 적용
    const handleSendEmail = async () => {
      setIsEmailSending(true); // 로딩 시작
      try {
        const data = await authApi.sendEmailCode(email);
        if (data.success) alert("인증 코드를 발송했습니다.");
        else alert(data.message || "이미 가입된 이메일입니다."); // 예외 처리
      } finally {
        setIsEmailSending(false); // 로딩 종료
      }
    };
    ```