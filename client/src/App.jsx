import { useState } from 'react'
import axios from 'axios'

function App() {

  // 1. state 생성
  const [data, setData] = useState('');
  const [resData, setResData] = useState({});

  const sendToServer = ()=>{
    console.log('sendToServer()실행');
    console.log('입력한 data : ', data);

    axios.post('http://localhost:3000/getData', {data:data})
    .then((res)=>{
      console.log('서버에서 온 데이터 : ', res.data);
      setResData(res.data);

    })
  }
  return (
    <>
      <h1>리액트 개발해서 노드로 보내기</h1>

      <div>
        <h2>Client에서 Server로 데이터 전송하기</h2>
        <input type="text" onChange={(e)=>{setData(e.target.value)}}/>
        <button onClick={sendToServer}>전송</button>
      </div>

      <div>
        <h2>Server에서 Client로 넘어온 데이터 출력하기</h2>
        {/* {data} */}
        {/* 데이터가 잘 넘어왔으면 status 200으로 받음
            status가 200일 때 p태그 출력할 수 있게 조건부 렌더링
        */}
        {/* <p>{resData}님 환영합니다.</p> */}
        {
          resData.status == 200 && <p>{resData.nick}님 환영합니다.</p>
        }
        
      </div>

    </>
  )
}

export default App
