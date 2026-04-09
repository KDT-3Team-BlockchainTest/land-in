package com.landin.backend.domain.event.dto;

import com.landin.backend.domain.step.entity.NftRarity;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class StepResponse {

    public enum StepState { DONE, CURRENT, LOCKED, REWARD }

    private UUID id;
    private int orderIndex;
    private String placeName;
    private String placeDescription;
    private String imageUrl;
    private String imageFallbackUrl;
    private BigDecimal lat;
    private BigDecimal lng;
    private boolean finalStep;
    private StepState state;

    // NFT template info
    private String nftName;
    private String nftImageUrl;
    private NftRarity nftRarity;

    public static StepResponse of(Step step, NftTemplate nftTemplate, StepState state) {
        StepResponse.StepResponseBuilder builder = StepResponse.builder()
                .id(step.getId())
                .orderIndex(step.getOrderIndex())
                .placeName(step.getPlaceName())
                .placeDescription(step.getPlaceDescription())
                .imageUrl(step.getImageUrl())
                .imageFallbackUrl(step.getImageFallbackUrl())
                .lat(step.getLat())
                .lng(step.getLng())
                .finalStep(step.isFinalStep())
                .state(state);

        if (nftTemplate != null) {
            builder.nftName(nftTemplate.getName())
                    .nftImageUrl(nftTemplate.getImageUrl())
                    .nftRarity(nftTemplate.getRarity());
        }

        return builder.build();
    }
}
