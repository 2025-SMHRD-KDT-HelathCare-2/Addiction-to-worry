import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

/* FSD (Feature-Sliced Design) 아키텍처에 따른 최상위 App 컴포넌트 */
import App from './app/App';
/* 전역 스타일 시트 초기화 및 적용 */
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 애플리케이션 전역 라우팅 컨텍스트 제공 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);