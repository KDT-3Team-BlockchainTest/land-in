package com.landin.backend.domain.nft.dto;

import com.landin.backend.domain.nft.entity.NftMintRequest;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class MintRequestResponse {

    private UUID mintRequestId;
    private String visitId;
    private String mintStatus;
    private String imageCid;
    private String metadataCid;
    private String tokenUri;
    private String polygonTxHash;
    private String polygonTokenId;
    private String fabricTxId;
    private String errorReason;
    private int retryCount;

    public static MintRequestResponse from(NftMintRequest req) {
        return MintRequestResponse.builder()
                .mintRequestId(req.getId())
                .visitId(req.getVisitId())
                .mintStatus(req.getMintStatus().name())
                .imageCid(req.getImageCid())
                .metadataCid(req.getMetadataCid())
                .tokenUri(req.getTokenUri())
                .polygonTxHash(req.getPolygonTxHash())
                .polygonTokenId(req.getPolygonTokenId())
                .fabricTxId(req.getFabricTxId())
                .errorReason(req.getErrorReason())
                .retryCount(req.getRetryCount())
                .build();
    }
}
