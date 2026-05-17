package com.landin.backend.domain.photodraft.entity;

/** 사진 초안 상태 (기획서 8.2 Photo Draft 상태 전이표) */
public enum PhotoDraftStatus {
    DRAFT_CREATED,
    UPLOADING,
    UPLOADED_TO_S3,
    EDITING,
    SELECTED_FOR_MINT,
    READY_FOR_IPFS,
    EXPIRED,
    DELETED
}
