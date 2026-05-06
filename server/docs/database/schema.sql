-- DB 생성
CREATE DATABASE capstone_db;
USE capstone_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    nickname VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20),
    status VARCHAR(20),
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE spaces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    deposit INT,
    monthly_rent INT,
    area DECIMAL(10,2),
    floor INT,
    is_available BOOLEAN,
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    FOREIGN KEY (landlord_id) REFERENCES users(id)
);

CREATE TABLE space_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    space_id BIGINT,
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    document_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE space_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    space_id BIGINT,
    image_url VARCHAR(255),
    sort_order INT,

    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    space_id BIGINT,
    admin_id BIGINT,
    status VARCHAR(20), -- PENDING, APPROVED, REJECTED
    reason TEXT,
    verified_at DATETIME,

    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    space_id BIGINT,
    status VARCHAR(20), -- ACTIVE, CLOSED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE chat_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id BIGINT,
    user_id BIGINT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,

    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id BIGINT,
    sender_id BIGINT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    space_id BIGINT,
    landlord_id BIGINT,
    tenant_id BIGINT,
    status VARCHAR(20), -- REQUESTED, CONTRACTED, CANCELLED, COMPLETED
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (landlord_id) REFERENCES users(id),
    FOREIGN KEY (tenant_id) REFERENCES users(id)
);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT,
    payer_id BIGINT,
    amount INT,
    status VARCHAR(20), -- READY, PAID, FAILED, REFUNDED
    paid_at DATETIME,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (payer_id) REFERENCES users(id)
);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT,
    reviewer_id BIGINT,
    rating INT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE TABLE favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    space_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, space_id),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
);

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT,
    space_id BIGINT,
    reason TEXT,
    status VARCHAR(20), -- PENDING, CHECKING, RESOLVED, REJECTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
);