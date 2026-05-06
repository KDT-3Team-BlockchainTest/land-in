# 📦 Database Schema (capstone_db)

## 1. 개요
본 프로젝트는 공실 임대/매칭 플랫폼으로,  
사용자, 공실, 채팅, 거래, 결제 등 기능을 지원한다.

---

## 2. 테이블 구성

### 👤 users (사용자)
| 컬럼명 | 설명 |
|--------|------|
| id | 사용자 ID |
| email | 이메일 |
| password | 비밀번호 |
| name | 이름 |
| nickname | 닉네임 |
| phone | 전화번호 |
| role | 역할 (LANDLORD / TENANT / ADMIN) |
| status | 상태 (ACTIVE / SUSPENDED / DELETED) |
| deleted_at | 탈퇴일 |
| created_at | 생성일 |

---

### 🏢 spaces (공실)
| 컬럼명 | 설명 |
|--------|------|
| id | 공실 ID |
| landlord_id | 임대인 ID |
| title | 제목 |
| description | 설명 |
| address | 주소 |
| latitude | 위도 |
| longitude | 경도 |
| deposit | 보증금 |
| monthly_rent | 월세 |
| area | 면적 |
| floor | 층수 |
| is_available | 공실 여부 |
| status | 상태 |
| created_at | 생성일 |
| deleted_at | 삭제일 |

---

### 📄 space_documents (공실 문서)
| 컬럼명 | 설명 |
|--------|------|
| id | 문서 ID |
| space_id | 공실 ID |
| file_url | 파일 경로 |
| file_name | 파일 이름 |
| document_type | 문서 유형 |
| created_at | 업로드일 |

---

### 🖼 space_images (공실 이미지)
| 컬럼명 | 설명 |
|--------|------|
| id | 이미지 ID |
| space_id | 공실 ID |
| image_url | 이미지 경로 |
| sort_order | 정렬 순서 |

---

### ✅ verifications (공실 인증)
| 컬럼명 | 설명 |
|--------|------|
| id | 인증 ID |
| space_id | 공실 ID |
| admin_id | 관리자 ID |
| status | 상태 (PENDING / APPROVED / REJECTED) |
| reason | 거절 사유 |
| verified_at | 인증 완료일 |

---

### 💬 chat_rooms (채팅방)
| 컬럼명 | 설명 |
|--------|------|
| id | 채팅방 ID |
| space_id | 공실 ID |
| status | 상태 |
| created_at | 생성일 |

---

### 👥 chat_participants (채팅 참여자)
| 컬럼명 | 설명 |
|--------|------|
| id | 참여 ID |
| chat_room_id | 채팅방 ID |
| user_id | 사용자 ID |
| joined_at | 참여 시간 |
| left_at | 나간 시간 |

---

### ✉️ chat_messages (채팅 메시지)
| 컬럼명 | 설명 |
|--------|------|
| id | 메시지 ID |
| chat_room_id | 채팅방 ID |
| sender_id | 발신자 ID |
| message | 메시지 |
| created_at | 전송 시간 |
| deleted_at | 삭제 시간 |

---

### 📑 transactions (거래)
| 컬럼명 | 설명 |
|--------|------|
| id | 거래 ID |
| space_id | 공실 ID |
| landlord_id | 임대인 ID |
| tenant_id | 임차인 ID |
| status | 상태 |
| start_date | 시작일 |
| end_date | 종료일 |
| created_at | 생성일 |

---

### 💰 payments (결제)
| 컬럼명 | 설명 |
|--------|------|
| id | 결제 ID |
| transaction_id | 거래 ID |
| payer_id | 결제자 ID |
| amount | 금액 |
| status | 상태 |
| paid_at | 결제 시간 |

---

### ⭐ reviews (후기)
| 컬럼명 | 설명 |
|--------|------|
| id | 후기 ID |
| transaction_id | 거래 ID |
| reviewer_id | 작성자 ID |
| rating | 평점 |
| content | 내용 |
| created_at | 작성일 |
| deleted_at | 삭제일 |

---

### ❤️ favorites (찜)
| 컬럼명 | 설명 |
|--------|------|
| id | 찜 ID |
| user_id | 사용자 ID |
| space_id | 공실 ID |
| created_at | 생성일 |

---

### 🚨 reports (신고)
| 컬럼명 | 설명 |
|--------|------|
| id | 신고 ID |
| reporter_id | 신고자 ID |
| space_id | 공실 ID |
| reason | 신고 사유 |
| status | 상태 |
| created_at | 생성일 |

---

## 3. 관계 (ERD 요약)

- users ↔ spaces (1:N)
- spaces ↔ chat_rooms (1:N)
- chat_rooms ↔ chat_messages (1:N)
- transactions ↔ payments (1:N)
- users ↔ favorites ↔ spaces (N:M)

---

## 4. 설계 정책

### 🔹 Soft Delete 사용
- users, spaces, reviews 등은 삭제 시 실제 삭제 X
- deleted_at 컬럼으로 관리

### 🔹 상태값 관리
- status 컬럼으로 흐름 관리 (승인, 거절 등)

### 🔹 무결성 유지
- FOREIGN KEY로 관계 유지

---

## 5. 파일 위치

```text
server/docs/database/
├── schema.sql
├── erd.dbml
└── README.md