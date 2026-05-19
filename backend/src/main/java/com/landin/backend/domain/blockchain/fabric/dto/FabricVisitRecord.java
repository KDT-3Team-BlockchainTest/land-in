package com.landin.backend.domain.blockchain.fabric.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** visitledger VisitContract:GetVisit 응답 DTO */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FabricVisitRecord {
    private String visitId;
    private String userIdHash;
    private String campaignId;
    private String tagIdHash;
    private String visitProofHash;
    private String locationCode;
    private String status;
    private String visitedAt;
    private String fabricTxId;
}
