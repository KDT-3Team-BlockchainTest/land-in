package com.landin.backend.domain.nft.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MintPolygonRequest {
    @NotBlank
    private String walletAddress;
}
