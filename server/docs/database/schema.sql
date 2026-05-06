-- DB 생성
-- PostgreSQL에서는 보통 psql이나 pgAdmin에서 DB를 먼저 생성한 뒤 접속해서 실행한다.
-- CREATE DATABASE capstone_db;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    nickname VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20),
    status VARCHAR(20),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE spaces (
    id BIGSERIAL PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    deposit INTEGER,
    monthly_rent INTEGER,
    area DECIMAL(10,2),
    floor INTEGER,
    is_available BOOLEAN,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (landlord_id) REFERENCES users(id)
);

CREATE TABLE space_documents (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT,
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    document_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE space_images (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT,
    image_url VARCHAR(255),
    sort_order INTEGER,

    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE verifications (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT,
    admin_id BIGINT,
    status VARCHAR(20), -- PENDING, APPROVED, REJECTED
    reason TEXT,
    verified_at TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT,
    status VARCHAR(20), -- ACTIVE, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE chat_participants (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT,
    user_id BIGINT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,

    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT,
    sender_id BIGINT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT,
    landlord_id BIGINT,
    tenant_id BIGINT,
    status VARCHAR(20), -- REQUESTED, CONTRACTED, CANCELLED, COMPLETED
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (landlord_id) REFERENCES users(id),
    FOREIGN KEY (tenant_id) REFERENCES users(id)
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT,
    payer_id BIGINT,
    amount INTEGER,
    status VARCHAR(20), -- READY, PAID, FAILED, REFUNDED
    paid_at TIMESTAMP,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (payer_id) REFERENCES users(id)
);

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT,
    reviewer_id BIGINT,
    rating INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    space_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, space_id),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT,
    space_id BIGINT,
    reason TEXT,
    status VARCHAR(20), -- PENDING, CHECKING, RESOLVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
);