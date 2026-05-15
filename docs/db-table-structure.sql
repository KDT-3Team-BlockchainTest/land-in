-- LandIn DB table structure reference
-- Target DB: MySQL 8.x, schema/database: landin_db
--
-- This file has two uses:
-- 1) Run the INFORMATION_SCHEMA queries below against an existing DB to inspect
--    the current physical table structure.
-- 2) Read or run the reference DDL below to understand the schema generated from
--    the project's Spring JPA entities.
--
-- Note: UUID columns are declared as CHAR(36) here for readability and for
-- compatibility with the existing data.sql usage of UUID(). Hibernate may choose
-- a different physical UUID type when it auto-generates tables.

USE landin_db;

-- ---------------------------------------------------------------------------
-- Quick inspection queries for an existing database
-- ---------------------------------------------------------------------------

SHOW TABLES;

SELECT
    table_name,
    ordinal_position,
    column_name,
    column_type,
    is_nullable,
    column_default,
    column_key,
    extra
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name IN (
      'users',
      'admins',
      'events',
      'steps',
      'nfc_tags',
      'nft_templates',
      'event_participations',
      'step_completions',
      'user_nfts',
      'reward_templates',
      'user_rewards',
      'nfc_scan_logs'
  )
ORDER BY table_name, ordinal_position;

SELECT
    table_name,
    index_name,
    non_unique,
    seq_in_index,
    column_name
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name IN (
      'users',
      'admins',
      'events',
      'steps',
      'nfc_tags',
      'nft_templates',
      'event_participations',
      'step_completions',
      'user_nfts',
      'reward_templates',
      'user_rewards',
      'nfc_scan_logs'
  )
ORDER BY table_name, index_name, seq_in_index;

SELECT
    table_name,
    constraint_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND referenced_table_name IS NOT NULL
ORDER BY table_name, constraint_name, ordinal_position;

-- ---------------------------------------------------------------------------
-- Reference DDL from JPA entities
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    wallet_address VARCHAR(255) NULL,
    wallet_chain_id BIGINT NULL,
    wallet_provider VARCHAR(255) NULL,
    wallet_connected_at DATETIME(6) NULL,
    nft_count BIGINT NOT NULL DEFAULT 0,
    landmark_count BIGINT NOT NULL DEFAULT 0,
    city_count BIGINT NOT NULL DEFAULT 0,
    country_count BIGINT NOT NULL DEFAULT 0,
    completed_collection_count BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
    id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    featured BIT NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    description TEXT NULL,
    hero_image_url VARCHAR(255) NULL,
    hero_image_fallback_url VARCHAR(255) NULL,
    map_image_url VARCHAR(255) NULL,
    partner_name VARCHAR(255) NULL,
    partner_logo_url VARCHAR(255) NULL,
    theme_color VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_events_status
        CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED', 'ENDED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS steps (
    id CHAR(36) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    place_description TEXT NULL,
    image_url VARCHAR(255) NULL,
    image_fallback_url VARCHAR(255) NULL,
    lat DECIMAL(10, 7) NULL,
    lng DECIMAL(10, 7) NULL,
    final_step BIT NOT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_step_event_order (event_id, order_index),
    CONSTRAINT fk_steps_event
        FOREIGN KEY (event_id) REFERENCES events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nfc_tags (
    id CHAR(36) NOT NULL,
    step_id CHAR(36) NOT NULL,
    tag_uid VARCHAR(255) NOT NULL,
    active BIT NOT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_nfc_tags_step_id (step_id),
    UNIQUE KEY uk_nfc_tags_tag_uid (tag_uid),
    CONSTRAINT fk_nfc_tags_step
        FOREIGN KEY (step_id) REFERENCES steps (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nft_templates (
    id CHAR(36) NOT NULL,
    step_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    rarity VARCHAR(255) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_nft_templates_step_id (step_id),
    CONSTRAINT chk_nft_templates_rarity
        CHECK (rarity IN ('COMMON', 'RARE', 'LEGENDARY')),
    CONSTRAINT fk_nft_templates_step
        FOREIGN KEY (step_id) REFERENCES steps (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_participations (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    joined_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_event_participations_user_event (user_id, event_id),
    KEY idx_event_participations_event_id (event_id),
    CONSTRAINT fk_event_participations_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_event_participations_event
        FOREIGN KEY (event_id) REFERENCES events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS step_completions (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    step_id CHAR(36) NOT NULL,
    completed_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_step_completions_user_step (user_id, step_id),
    KEY idx_sc_user_step (user_id, step_id),
    KEY idx_step_completions_step_id (step_id),
    CONSTRAINT fk_step_completions_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_step_completions_step
        FOREIGN KEY (step_id) REFERENCES steps (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_nfts (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    step_id CHAR(36) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    nft_template_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    rarity VARCHAR(255) NOT NULL,
    minted_at DATETIME(6) NOT NULL,
    mint_status VARCHAR(255) NULL,
    on_chain_chain_id BIGINT NULL,
    contract_address VARCHAR(255) NULL,
    token_uri VARCHAR(1024) NULL,
    token_id VARCHAR(128) NULL,
    transaction_hash VARCHAR(128) NULL,
    on_chain_minted_at DATETIME(6) NULL,
    mint_failure_reason VARCHAR(1000) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_nfts_user_step (user_id, step_id),
    KEY idx_user_nft_user_event (user_id, event_id),
    KEY idx_user_nfts_step_id (step_id),
    KEY idx_user_nfts_event_id (event_id),
    KEY idx_user_nfts_nft_template_id (nft_template_id),
    CONSTRAINT chk_user_nfts_rarity
        CHECK (rarity IN ('COMMON', 'RARE', 'LEGENDARY')),
    CONSTRAINT chk_user_nfts_mint_status
        CHECK (
            mint_status IS NULL
            OR mint_status IN (
                'OFFCHAIN_ONLY',
                'PENDING_WALLET',
                'PENDING_ONCHAIN',
                'MINTED_ONCHAIN',
                'FAILED_ONCHAIN'
            )
        ),
    CONSTRAINT fk_user_nfts_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_user_nfts_step
        FOREIGN KEY (step_id) REFERENCES steps (id),
    CONSTRAINT fk_user_nfts_event
        FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT fk_user_nfts_nft_template
        FOREIGN KEY (nft_template_id) REFERENCES nft_templates (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reward_templates (
    id CHAR(36) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    partner_name VARCHAR(255) NOT NULL,
    how_to_use TEXT NULL,
    validity_days INT NOT NULL,
    emoji VARCHAR(255) NULL,
    accent_color VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_reward_templates_event_id (event_id),
    CONSTRAINT fk_reward_templates_event
        FOREIGN KEY (event_id) REFERENCES events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_rewards (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    reward_template_id CHAR(36) NOT NULL,
    coupon_code VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    issued_at DATETIME(6) NOT NULL,
    valid_until DATE NOT NULL,
    used_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_rewards_user_event (user_id, event_id),
    UNIQUE KEY uk_user_rewards_coupon_code (coupon_code),
    KEY idx_user_rewards_event_id (event_id),
    KEY idx_user_rewards_reward_template_id (reward_template_id),
    CONSTRAINT chk_user_rewards_status
        CHECK (status IN ('AVAILABLE', 'USED', 'EXPIRED')),
    CONSTRAINT fk_user_rewards_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_user_rewards_event
        FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT fk_user_rewards_reward_template
        FOREIGN KEY (reward_template_id) REFERENCES reward_templates (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nfc_scan_logs (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    tag_uid VARCHAR(255) NOT NULL,
    scanned_at DATETIME(6) NOT NULL,
    result VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_nfc_scan_logs_user_id (user_id),
    CONSTRAINT chk_nfc_scan_logs_result
        CHECK (
            result IN (
                'SUCCESS',
                'ALREADY_DONE',
                'WRONG_ORDER',
                'NOT_JOINED',
                'UNKNOWN_TAG'
            )
        ),
    CONSTRAINT fk_nfc_scan_logs_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
