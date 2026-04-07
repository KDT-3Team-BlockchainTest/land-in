import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ⭐ useNavigate 추가
import './login.css';

const Login = () => {
  const navigate = useNavigate(); // ⭐ 페이지 이동을 도와주는 함수 켜기

  // ⭐ 로그인 버튼을 눌렀을 때 실행될 함수
  const handleLogin = (e) => {
    e.preventDefault(); // 버튼을 눌렀을 때 페이지가 새로고침 되는 걸 막아줍니다.
    
    // (나중에 여기에 실제 서버와 아이디/비번 확인하는 로직이 들어갑니다)
    // 지금은 무조건 성공한다고 가정하고 홈 화면으로 바로 보냅니다!
    
    navigate('/app'); // ⭐ router.jsx에서 설정한 메인 앱 경로로 슉! 이동
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo-icon.png" alt="Land-In" />
        </div>
        
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Land-In으로 여행을 시작하세요</p>

        {/* ⭐ 폼에 onSubmit 이벤트로 방금 만든 함수를 연결해 줍니다 */}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>이메일</label>
            <div className="input-wrapper">
              <i className="icon-mail"></i>
              <input type="email" placeholder="your@email.com" />
            </div>
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <div className="input-wrapper">
              <i className="icon-lock"></i>
              <input type="password" placeholder="비밀번호를 입력하세요" />
              <i className="icon-eye-off"></i>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              로그인 상태 유지
            </label>
            <span className="find-pw">비밀번호 찾기</span>
          </div>

          <button type="submit" className="auth-submit-btn">로그인</button>
        </form>

        <div className="divider">또는</div>

        <div className="social-login-group">
          <button className="social-btn google">
            <img src="/google-icon.png" alt="" /> Google로 계속하기
          </button>
          <button className="social-btn apple">
            <img src="/apple-icon.png" alt="" /> Apple로 계속하기
          </button>
          <button className="social-btn kakao">
            <img src="/kakao-icon.png" alt="" /> 카카오로 계속하기
          </button>
        </div>

        <div className="auth-footer">
          계정이 없으신가요? <Link to="/join" className="link-text">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;