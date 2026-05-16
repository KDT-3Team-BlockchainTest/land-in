package com.landin.backend.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Auth
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),
    INVALID_WALLET_NETWORK(HttpStatus.BAD_REQUEST, "Hoodi 테스트넷 지갑으로 다시 연결해 주세요."),

    // Event
    EVENT_NOT_FOUND(HttpStatus.NOT_FOUND, "이벤트를 찾을 수 없습니다."),
    EVENT_NOT_JOINABLE(HttpStatus.BAD_REQUEST, "참여할 수 없는 이벤트 상태입니다. active 이벤트만 참여 가능합니다."),

    // Participation
    ALREADY_JOINED(HttpStatus.CONFLICT, "이미 참여 중인 이벤트입니다."),
    NOT_JOINED(HttpStatus.FORBIDDEN, "참여하지 않은 이벤트입니다."),

    // NFC / Tag
    UNKNOWN_TAG(HttpStatus.NOT_FOUND, "등록되지 않은 NFC 태그입니다."),
    TAG_INACTIVE(HttpStatus.BAD_REQUEST, "비활성화된 NFC 태그입니다."),
    STEP_ALREADY_DONE(HttpStatus.CONFLICT, "이미 완료한 스텝입니다."),
    WRONG_ORDER(HttpStatus.BAD_REQUEST, "이전 스텝을 먼저 완료해야 합니다."),

    // NFT
    NFT_NOT_FOUND(HttpStatus.NOT_FOUND, "NFT를 찾을 수 없습니다."),
    PHOTO_DRAFT_NOT_FOUND(HttpStatus.NOT_FOUND, "사진 초안을 찾을 수 없습니다."),
    DRAFT_NOT_READY_FOR_IPFS(HttpStatus.BAD_REQUEST, "IPFS 업로드 가능한 상태가 아닙니다."),
    DUPLICATE_NFT_MINT(HttpStatus.CONFLICT, "이미 민팅 요청이 존재하는 사진 초안입니다."),
    NFT_MINT_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "NFT 민팅 요청을 찾을 수 없습니다."),
    MINT_NOT_READY_FOR_REWARD(HttpStatus.BAD_REQUEST, "포인트 지급 가능한 민팅 상태가 아닙니다."),
    FABRIC_REWARD_FAILED(HttpStatus.BAD_GATEWAY, "Fabric 포인트 지급에 실패했습니다."),
    FABRIC_NFT_RECORD_FAILED(HttpStatus.BAD_GATEWAY, "Fabric NFT 기록에 실패했습니다."),

    // Reward
    REWARD_NOT_FOUND(HttpStatus.NOT_FOUND, "리워드를 찾을 수 없습니다."),
    REWARD_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "사용할 수 없는 리워드입니다. available 상태만 사용 가능합니다."),

    // Admin
    ADMIN_NOT_FOUND(HttpStatus.NOT_FOUND, "관리자를 찾을 수 없습니다."),
    ADMIN_EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 관리자 이메일입니다."),
    ADMIN_FORBIDDEN(HttpStatus.FORBIDDEN, "다른 제휴사의 자원은 수정할 수 없습니다."),
    EVENT_ID_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 이벤트 ID 입니다."),
    DUPLICATE_TAG_UID(HttpStatus.CONFLICT, "이미 등록된 NFC 태그 UID 입니다."),
    DUPLICATE_STEP_ORDER(HttpStatus.CONFLICT, "이미 사용된 스텝 순서입니다."),
    STEP_NOT_FOUND(HttpStatus.NOT_FOUND, "스텝을 찾을 수 없습니다."),
    INVALID_UPLOAD(HttpStatus.BAD_REQUEST, "업로드할 수 없는 파일입니다."),
    STEP_PLACE_IMAGE_REQUIRED(HttpStatus.BAD_REQUEST, "각 스텝에는 장소 이미지가 필요합니다."),
    STEP_NFT_IMAGE_REQUIRED(HttpStatus.BAD_REQUEST, "각 스텝에는 NFT 이미지가 필요합니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
