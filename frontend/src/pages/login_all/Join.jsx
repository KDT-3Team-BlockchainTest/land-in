import React from 'react';
import './Join.css';
import { Link } from 'react-router-dom';

const Join = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"></div>
        <h1 className="auth-title">Join Land-In</h1>
        <p className="auth-subtitle">새로운 여행 경험을 시작하세요</p>

        <form className="auth-form">
          <div className="input-group">
            <label>이름</label>
            <input type="text" placeholder="홍길동" className="join-input" />
          </div>

          <div className="input-group">
            <label>이메일</label>
            <input type="email" placeholder="your@email.com" className="join-input" />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input type="password" placeholder="8자 이상 입력하세요" className="join-input" />
          </div>

          <div className="input-group">
            <label>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호를 다시 입력하세요" className="join-input" />
          </div>

          <div className="terms-box">
            <div className="terms-item all-agree">
              <input type="checkbox" id="all" />
              <label htmlFor="all">전체 동의</label>
            </div>
            <hr />
            <div className="terms-item">
              <input type="checkbox" id="term1" />
              <label htmlFor="term1"><span>[필수]</span> 서비스 이용약관</label>
              <span className="view-link">보기</span>
            </div>
            <div className="terms-item">
              <input type="checkbox" id="term2" />
              <label htmlFor="term2"><span>[필수]</span> 개인정보 처리방침</label>
              <span className="view-link">보기</span>
            </div>
            <div className="terms-item">
              <input type="checkbox" id="term3" />
              <label htmlFor="term3"><span>[선택]</span> 마케팅 정보 수신</label>
              <span className="view-link">보기</span>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">회원가입</button>
        </form>
        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
         이미 계정이 있으신가요? <Link to="/" className="link-text">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Join;