// routes/test.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // 새로 만든 풀 불러오기

// async를 붙여서 비동기 모드로 실행
router.get('/db-test', async (req, res, next) => {
    try {
        // 1. await를 사용하여 DB 결과를 기다림
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        
        // 2. 성공 시 규격에 맞춰 응답
        res.json({
            success: true,
            message: "DB 연결 테스트 성공!",
            data: rows[0]
        });

    } catch (err) {
        // 3. 에러 발생 시 next(err)를 호출하면 
        // app.js에 만든 공통 핸들러로 자동으로 넘어감!
        next(err); 
    }
});

module.exports = router;