// 1. 외부 모듈 로드
const express = require('express');
const path = require('path');
const cors = require('cors');

// 2. 서버 객체 만들기
const app = express();

// 3. 포트 번호 지정
app.set('port', process.env.PORT||3000);

// 7. dist폴더안에 접근하는 코드
app.use(express.static(path.join(__dirname, '../client/dist')));

// 8. cors 설정
app.use(cors());

// 9. post 방식의 데이터 주고 받을 때 인코딩 처리
//    json형식으로 오는 데이터를 js객체로 처리를 할 수 있게 변경
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// 5. 만들어둔 라우터 설계도(index.js) 가져오기
const mainRouter = require('./routes/main');

// 6. '/'로 들어오면 indexRouter로 보내야해요.
app.use('/', mainRouter);


// 4. 서버 실행
app.listen(app.get('port'), ()=>{console.log(`${app.get('port')}번 포트에서 대기중...`);});

// 7. 노드 서버 실행
// > nodemon app.js

// 8. 브라우저 창에서 'localhost:3000/' 실행