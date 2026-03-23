// config/database.js
const mysql = require('mysql2/promise'); // promise 버전 사용 (try-catch를 위해)
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,    // 연결이 다 차면 대기
    connectionLimit: 10,         // 최대 10개의 통로를 미리 열어둠
    queueLimit: 0
});

// 연결 테스트 (서버 실행 시 확인용)
pool.getConnection()
    .then(conn => {
        console.log("✅ DB 커넥션 풀 준비 완료!");
        conn.release(); // 테스트 후 통로 반납
    })
    .catch(err => {
        console.error("❌ DB 풀 생성 실패:", err.message);
    });

module.exports = pool;