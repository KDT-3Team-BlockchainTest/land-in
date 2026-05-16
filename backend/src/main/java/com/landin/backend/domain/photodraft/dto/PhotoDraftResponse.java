package com.landin.backend.domain.photodraft.dto;

import com.landin.backend.domain.photodraft.entity.PhotoDraft;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PhotoDraftResponse {

    private UUID draftId;
    private String visitId;
    private String status;
    private String thumbnailUrl;
    private String editedS3Url;
    private String filterType;
    private String frameId;
    private String moderationStatus;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public static PhotoDraftResponse from(PhotoDraft draft) {
        return PhotoDraftResponse.builder()
                .draftId(draft.getId())
                .visitId(draft.getVisitId())
                .status(draft.getStatus().name())
                .thumbnailUrl(draft.getThumbnailUrl())
                .editedS3Url(draft.getEditedS3Url())
                .filterType(draft.getFilterType())
                .frameId(draft.getFrameId())
                .moderationStatus(draft.getModerationStatus())
                .expiresAt(draft.getExpiresAt())
                .createdAt(draft.getCreatedAt())
                .build();
    }
}
