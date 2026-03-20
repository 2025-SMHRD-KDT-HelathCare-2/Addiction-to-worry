// mysql2 : mysql과 db를 연결해서 쿼리문을 실행시킬 수 있는 모듈
const mysql = require("mysql2");

// mysql 터미널 명령어 : npm install mysql2
// 사용할 db 정보 정의
// host, user, password, port, database
const db_info = {
    host: "project-db-campus.smhrd.com",
    user: "sc_25K_HI2_p2_1",
    password: "smhrd1",
    port: "3312",
    database: "sc_25K_HI2_p2_1"
};

// db연결 객체 생성
// mysql database 연결 통로 생성
module.exports = mysql.createConnection(db_info);
