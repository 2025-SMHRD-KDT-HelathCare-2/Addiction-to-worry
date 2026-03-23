// routes/main.js 최종본
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // DB 설정 불러오기

router.get('/', async (req, res, next) => {
    try {
        // 1. 실제로 DB에 질문을 던져봅니다.
        const [rows] = await pool.query("SELECT '연결 완료' as status");

        // 2. 성공하면 DB 결과와 함께 응답을 보냅니다.
        res.json({
            success: true,
            message: "서버와 DB가 모두 정상입니다!",
            db_data: rows[0].status
        });
    } catch (err) {
        // 3. 만약 DB에서 에러가 나면 무한 로딩에 빠지지 않게 에러 핸들러로 던집니다.
        console.error("DB 쿼리 에러:", err.message);
        next(err); 
    }
});

module.exports = router;