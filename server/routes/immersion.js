const express = require('express');
const router = express.Router();
const db = require('../config/database'); // DB 설정 파일 경로

/**
 * [1] 집중 시작 API (POST /api/immersion/start)
 * 
 */
router.post('/start', async (req, res) => {
    const { user_idx } = req.body;
    const now = new Date();
    const imm_date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const start_time = now.toTimeString().split(' ')[0]; // HH:mm:ss

    try {
        const sql = "INSERT INTO immersions (user_idx, imm_date, start_time, imm_score) VALUES (?, ?, ?, 0)";
        const [result] = await db.query(sql, [user_idx, imm_date, start_time]);
        
        // 리액트 작업자에게 이 imm_idx를 꼭 써서 로그를 보내달라고 가이드해야 합니다.
        res.json({ success: true, imm_idx: result.insertId });
    } catch (err) {
        console.error("세션 시작 실패:", err);
        res.status(500).json({ success: false });
    }
});

/**
 * [2] 실시간 중요 이벤트 기록 API (보강 버전)
 */
router.post('/log', async (req, res) => {
    const { imm_idx, noise, pose, client_time } = req.body; 

    try {
        // 1. 중복 체크 (선택 사항: 같은 세션에 같은 시간에 기록된 로그가 있는지 확인)
        // 리액트가 재시도할 때 똑같은 데이터를 또 보낼 수 있기 때문입니다.
        
        // 2. 소음 데이터 저장
        if (noise) {
            const noiseSql = `
                INSERT INTO noises (imm_idx, decibel, obj_name, detected_at) 
                SELECT ?, ?, ?, NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM noises 
                    WHERE imm_idx = ? AND detected_at >= DATE_SUB(NOW(), INTERVAL 1 SECOND)
                    AND decibel = ?
                )
            `;
            // 1초 이내에 동일한 데시벨 데이터가 이미 있다면 저장을 건너뜁니다.
            await db.query(noiseSql, [imm_idx, noise.decibel, noise.obj_name, imm_idx, noise.decibel]);
        }

        // 3. 자세 데이터 저장
        if (pose) {
            const poseSql = `
                INSERT INTO poses (imm_idx, pose_status, pose_type, detected_at) 
                SELECT ?, ?, ?, NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM poses 
                    WHERE imm_idx = ? AND detected_at >= DATE_SUB(NOW(), INTERVAL 1 SECOND)
                    AND pose_status = ?
                )
            `;
            await db.query(poseSql, [imm_idx, pose.pose_status, pose.pose_type, imm_idx, pose.pose_status]);
        }

        res.json({ success: true });
    } catch (err) {
        // DB가 꽉 찼거나 일시적 오류일 때 503 코드를 주어 리액트가 '나중에 재시도'하게 유도
        console.error("[RETRY LOG] 데이터 저장 실패:", err.message);
        res.status(503).json({ 
            success: false, 
            message: "Server busy, please retry later" 
        });
    }
});

/**
 * [3] 집중 종료 API (POST /api/immersion/end)
 * 리액트: "공부 끝! 최종 성적표야" -> 서버: "기록표 완성해서 닫을게"
 */
router.post('/end', async (req, res) => {
    const { imm_idx, imm_score } = req.body;
    const end_time = new Date().toTimeString().split(' ')[0];

    try {
        const sql = "UPDATE immersions SET end_time = ?, imm_score = ? WHERE imm_idx = ?";
        await db.query(sql, [end_time, imm_score, imm_idx]);
        res.json({ success: true });
    } catch (err) {
        console.error("세션 종료 업데이트 실패:", err);
        res.status(500).json({ success: false });
    }
});

/**
 * [4] 리포트 데이터 조회 API (GET /api/immersion/report/:imm_idx)
 * 리액트 작업자가 만든 Report.jsx 화면에 뿌려줄 데이터를 가져오는 입구입니다.
 */
router.get('/report/:imm_idx', async (req, res) => {
    const { imm_idx } = req.params;
    
    try {
        // 아직 8단계 로직을 다 짜진 않았지만, 
        // 리액트 작업자가 페이지를 열었을 때 404 에러가 나지 않도록 응답 형식을 맞춰둡니다.
        res.json({ 
            success: true, 
            message: "리포트 데이터를 준비 중입니다.",
            dummy_status: true // 나중에 실제 데이터로 교체할 예정
        });
    } catch (err) {
        console.error("리포트 조회 실패:", err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;