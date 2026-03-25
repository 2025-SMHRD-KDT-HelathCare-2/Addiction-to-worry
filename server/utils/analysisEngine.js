/**
 * 사용자의 포즈 데이터를 바탕으로 카메라 위치(정면/측면)를 감지합니다.
 * @param {Object} landmarks - MediaPipe에서 넘어온 포즈 데이터
 */
const detectCameraMode = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return 'UNKNOWN';

    // 왼쪽 귀와 오른쪽 귀의 가시성(visibility)이나 좌표 차이를 이용
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];

    // 두 귀가 모두 잘 보이면 '정면', 한쪽만 유독 잘 보이면 '측면'으로 판정
    const earVisibilityDiff = Math.abs(leftEar.visibility - rightEar.visibility);
    
    if (earVisibilityDiff > 0.5) {
        return 'SIDE_VIEW'; // 측면
    } else {
        return 'FRONT_VIEW'; // 정면
    }
};

/**
 * 주변 소음 수치를 분석하여 몰입 방해 요소를 판정합니다.
 * @param {Number} db - 클라이언트에서 측정된 데시벨 값
 */
const analyzeNoiseLevel = (db) => {
    if (db > 70) return 'NOISY';      // 시끄러움 (경고 필요)
    if (db > 40) return 'NORMAL';     // 보통
    return 'QUIET';                   // 몰입하기 좋은 상태
};

/**
 * 예외 처리: 사용자가 카메라 범위를 벗어났을 때
 */
const checkUserPresence = (landmarks) => {
    if (!landmarks || landmarks.length < 11) { // 주요 상체 포인트가 없는 경우
        return false; // 사용자 이탈
    }
    return true;
};

/*세부 자세 분석 (턱 괴기, 엎드림 등)
 */
const analyzePosture = (landmarks) => {
    if (!landmarks || landmarks.length < 11) return 'UNKNOWN';

    const nose = landmarks[0];           // 코
    const leftShoulder = landmarks[11];  // 왼쪽 어깨
    const rightShoulder = landmarks[12]; // 오른쪽 어깨
    const leftWrist = landmarks[15];     // 왼쪽 손목
    const rightWrist = landmarks[16];    // 오른쪽 손목

    // [판정 A] 엎드림/거북목: 코가 어깨선보다 한참 아래로 내려갈 때
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    if (nose.y > shoulderY) return 'SLUMPED';

    // [판정 B] 턱 괴기: 손목이 코 근처(매우 가까운 거리)에 있을 때
    const distLeft = Math.sqrt(Math.pow(nose.x - leftWrist.x, 2) + Math.pow(nose.y - leftWrist.y, 2));
    const distRight = Math.sqrt(Math.pow(nose.x - rightWrist.x, 2) + Math.pow(nose.y - rightWrist.y, 2));
    
    // 거리 기준값(0.12)은 환경에 따라 조정 가능
    if (distLeft < 0.12 || distRight < 0.12) return 'LEANING_ON_HAND';

    return 'GOOD_POSTURE';
};

/**
 * 5. 상황별 코칭 메시지 생성
 */
const getCoachingMessage = (posture, noise) => {
    if (posture === 'SLUMPED') return "자세가 너무 낮아요! 허리를 쭉 펴볼까요?";
    if (posture === 'LEANING_ON_HAND') return "턱을 괴면 척추가 휘어질 수 있어요.";
    if (noise === 'NOISY') return "주변이 조금 시끄럽네요. 이어폰 착용을 추천드려요.";
    return "집중하기 딱 좋은 자세입니다!";
};

// 모든 함수 내보내기
module.exports = { 
    detectCameraMode, 
    analyzeNoiseLevel, 
    checkUserPresence, 
    analyzePosture, 
    getCoachingMessage 
};