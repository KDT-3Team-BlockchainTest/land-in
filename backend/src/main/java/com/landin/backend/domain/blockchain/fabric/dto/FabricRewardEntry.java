package com.landin.backend.domain.blockchain.fabric.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** visitledger QueryContract:GetRewardHistoryByUser 응답 항목 DTO */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FabricRewardEntry {
    private String rewardTxId;
    private String userIdHash;
    private String visitId;
    private String mintRecordId;
    private String campaignId;
    private String partnerId;
    private int pointAmount;
    private String rewardType;  // "GRANT" | "USE"
    private String status;
    private String grantedAt;
    private String fabricTxId;
}
