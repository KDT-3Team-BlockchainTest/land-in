package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.step.entity.NfcTag;
import com.landin.backend.domain.step.entity.NftRarity;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class AdminStepResponse {

    private UUID id;
    private int orderIndex;
    private String placeName;
    private String placeDescription;
    private String imageUrl;
    private BigDecimal lat;
    private BigDecimal lng;
    private boolean finalStep;

    private String tagUid;

    private String nftName;
    private String nftImageUrl;
    private NftRarity nftRarity;
    private String nftDescription;

    public static AdminStepResponse of(Step step, NfcTag tag, NftTemplate template) {
        return AdminStepResponse.builder()
                .id(step.getId())
                .orderIndex(step.getOrderIndex())
                .placeName(step.getPlaceName())
                .placeDescription(step.getPlaceDescription())
                .imageUrl(step.getImageUrl())
                .lat(step.getLat())
                .lng(step.getLng())
                .finalStep(step.isFinalStep())
                .tagUid(tag != null ? tag.getTagUid() : null)
                .nftName(template != null ? template.getName() : null)
                .nftImageUrl(template != null ? template.getImageUrl() : null)
                .nftRarity(template != null ? template.getRarity() : null)
                .nftDescription(template != null ? template.getDescription() : null)
                .build();
    }
}
