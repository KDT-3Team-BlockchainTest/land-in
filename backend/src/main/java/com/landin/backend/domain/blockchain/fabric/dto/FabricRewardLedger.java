package com.landin.backend.domain.blockchain.fabric.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** visitledger RewardContract:GetPointBalance 응답 DTO */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FabricRewardLedger {
    private String userIdHash;
    private int totalPoints;
    private String updatedAt;
}
