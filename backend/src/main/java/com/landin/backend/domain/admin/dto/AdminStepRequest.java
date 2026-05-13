package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.step.entity.NftRarity;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminStepRequest {

    @Min(1)
    private int orderIndex;

    @NotBlank
    private String placeName;

    private String placeDescription;

    private String imageUrl;

    private BigDecimal lat;
    private BigDecimal lng;

    private boolean finalStep;

    @NotBlank
    private String tagUid;

    @NotBlank
    private String nftName;

    private String nftImageUrl;

    @NotNull
    private NftRarity nftRarity;

    private String nftDescription;
}
