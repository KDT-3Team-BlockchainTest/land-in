import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../admin/authContxt";
import "./myPage.css";

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const profileData = user
    ? { nickname: user.nickname, name: user.name, id: user.id, phone: user.phone, role: user.role }
    : null;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nickname: profileData?.nickname ?? "",
    password: "",
    phone: profileData?.phone ?? "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    alert("정보가 수정되었습니다. (테스트)");
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ nickname: profileData?.nickname ?? "", password: "", phone: profileData?.phone ?? "" });
    setEditing(false);
  };

  return (
    <div className="my-page">
      <div className="my-title-row">
        <h2 className="my-title">마이페이지</h2>
        {user && !editing && (
          <button className="my-edit-btn" onClick={() => setEditing(true)}>정보 수정</button>
        )}
        {user && editing && (
          <div className="my-edit-actions">
            <button className="my-cancel-btn" onClick={handleCancel}>취소</button>
            <button className="my-save-btn" onClick={handleSave}>저장</button>
          </div>
        )}
      </div>

      <div className="my-body">
        <div className="my-left">
          {user ? (
            <div className="profile-card">
              <div className="profile-avatar">
                <span>👤</span>
              </div>
              <div className="profile-details">
                <div className="profile-row">
                  <span className="profile-label">닉네임</span>
                  {editing ? (
                    <input className="profile-input" name="nickname" value={form.nickname} onChange={handleChange} />
                  ) : (
                    <span className="profile-value">{profileData.nickname}</span>
                  )}
                </div>
                <div className="profile-row">
                  <span className="profile-label">이름</span>
                  <span className={`profile-value ${editing ? "profile-value--disabled" : ""}`}>{profileData.name}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">계정 정보</span>
                  <span className={`profile-value ${editing ? "profile-value--disabled" : ""}`}>{profileData.id}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">비밀번호</span>
                  {editing ? (
                    <input className="profile-input" name="password" type="password" placeholder="새 비밀번호" value={form.password} onChange={handleChange} />
                  ) : (
                    <span className="profile-value">••••••••</span>
                  )}
                </div>
                <div className="profile-row">
                  <span className="profile-label">전화번호</span>
                  {editing ? (
                    <input className="profile-input" name="phone" value={form.phone} onChange={handleChange} />
                  ) : (
                    <span className="profile-value">{profileData.phone}</span>
                  )}
                </div>
                <div className="profile-row">
                  <span className="profile-label">회원 유형</span>
                  <span className={`profile-value ${editing ? "profile-value--disabled" : ""}`}>{profileData.role === "tenant" ? "임차인" : "임대인"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-card profile-card--guest">
              <div className="profile-avatar">
                <span>👤</span>
              </div>
              <p className="guest-msg">로그인 후 프로필을 확인할 수 있습니다.</p>
              <button className="guest-login-btn" onClick={() => navigate("/login")}>로그인하기</button>
            </div>
          )}
        </div>

        <div className="my-right">
          {user ? (
            <div className="placeholder-card">
              <p>임시 형식</p>
            </div>
          ) : (
            <div className="placeholder-card placeholder-card--guest">
              <p>로그인 후 이용해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
