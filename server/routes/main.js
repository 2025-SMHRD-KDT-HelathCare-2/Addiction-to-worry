const express = require('express');
const path = require('path');
const router = express.Router();

// database.js에 정리된 정보대로 DB connection객체 생성
//const conn = require('../config/database');


// 메인 페이지
// 사용자가 '/'로 들어오면 할일
router.get('/', (req, res)=>{
    console.log('서버 접근!!');

    // 리액트 프로젝트의 index.html 띄워주기
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

router.post('/getData', (req, res)=>{
    console.log('getData Router값', req.body);
    // {data:'데이터'}
    // 데이터 접근하는 방법 req.body;

    let sql = 'insert into react_data values (?)';

    // 매개변수 3개 : sql문, [넣을 데이터], ()=>{결과 확인하는 콜백함수}
    conn.query(sql, [req.body.data], (err, rows)=>{
        // 성공적으로 sql문 실행하면 rows가 있는데
        // 실행 실패하면 rows가 undefined -> false
        console.log('rows에 담긴 값 : ', rows);

        if(rows){
            // 성공했을 때
             // getData라는 요청 안에서 client로 데이터 전송까지
            res.json({status:200, nick:req.body.data});
        }else{
            // 실패했을 때
            res.json({status:500});
        }

    });


    
});

module.exports = router;