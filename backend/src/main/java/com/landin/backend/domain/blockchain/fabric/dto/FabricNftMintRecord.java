package com.landin.backend.domain.blockchain.fabric.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** visitledger NftRecordContract:GetNftMintRecord 응답 DTO */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FabricNftMintRecord {
    private String mintRecordId;
    private String visitId;
    private String draftId;
    private String userIdHash;
    private String tokenId;
    private String ownerAddress;
    private String imageCid;
    private String metadataCid;
    private String polygonTxHash;
    private String mintStatus;
    private String mintedAt;
    private String fabricTxId;
}
