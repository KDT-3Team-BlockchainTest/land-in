package com.landin.backend.domain.blockchain.fabric;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.landin.backend.domain.blockchain.fabric.dto.FabricNftMintRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * visitledger NftRecordContract 함수 호출 담당.
 *
 * <ul>
 *   <li>RecordNFTMint - Polygon mint 성공 후 Fabric 기록 (submitTransaction)</li>
 *   <li>GetNftMintRecord - NFT 발급 레코드 조회 (evaluateTransaction)</li>
 *   <li>FindMintRecordByVisit - visitId로 NFT 레코드 조회 (evaluateTransaction)</li>
 *   <li>ReconcileNFTMintFailure - MINTED_BUT_FABRIC_RECORD_FAILED 복구 (submitTransaction)</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FabricNftGateway {

    private static final String CONTRACT_PREFIX = "NftRecordContract";

    private final FabricGatewayFactory gatewayFactory;
    private final ObjectMapper objectMapper;

    /**
     * Polygon ERC-721 mint 성공 후 Fabric 원장에 NFT 발급 사실을 기록한다.
     *
     * <p>기획서 순서 보장: Polygon mint 성공(txHash 수신) → 이 함수 호출.
     * Fabric 미연결 시 FabricException을 던져 호출자가 상태를 MINTED_BUT_FABRIC_RECORD_FAILED로 저장하게 한다.
     *
     * @param mintRecordId  DB의 nft_mint_requests.id
     * @param visitId       Fabric 원장에 존재하는 visitId
     * @param draftId       DB의 photo_drafts.id (없으면 빈 문자열)
     * @param userIdHash    userId SHA-256 해시
     * @param tokenId       Polygon tokenId
     * @param ownerAddress  NFT 소유자 지갑 주소
     * @param imageCid      IPFS 이미지 CID
     * @param metadataCid   IPFS metadata CID
     * @param polygonTxHash Polygon 트랜잭션 해시
     * @param mintedAt      민팅 시각 (RFC3339)
     */
    public void recordNFTMint(
            String mintRecordId,
            String visitId,
            String draftId,
            String userIdHash,
            String tokenId,
            String ownerAddress,
            String imageCid,
            String metadataCid,
            String polygonTxHash,
            String mintedAt
    ) {
        if (!gatewayFactory.isAvailable()) {
            log.warn("[FabricNftGateway] Fabric not available — RecordNFTMint skipped. mintRecordId={}", mintRecordId);
            return;
        }

        try {
            gatewayFactory.submit(
                    CONTRACT_PREFIX + ":RecordNFTMint",
                    mintRecordId, visitId, draftId != null ? draftId : "",
                    userIdHash, tokenId, ownerAddress,
                    imageCid, metadataCid, polygonTxHash, mintedAt
            );
            log.info("[FabricNftGateway] RecordNFTMint committed. mintRecordId={}, visitId={}, tokenId={}",
                    mintRecordId, visitId, tokenId);
        } catch (FabricException e) {
            log.error("[FabricNftGateway] RecordNFTMint failed. mintRecordId={} error={}", mintRecordId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * mintRecordId로 Fabric 원장에서 NFT 발급 레코드를 조회한다.
     *
     * @return FabricNftMintRecord, 또는 null
     */
    public FabricNftMintRecord getNftMintRecord(String mintRecordId) {
        byte[] result = gatewayFactory.evaluate(CONTRACT_PREFIX + ":GetNftMintRecord", mintRecordId);
        return parseOrNull(result, FabricNftMintRecord.class);
    }

    /**
     * visitId로 연결된 NFT 발급 레코드를 조회한다.
     *
     * @return FabricNftMintRecord, 또는 null
     */
    public FabricNftMintRecord findMintRecordByVisit(String visitId) {
        byte[] result = gatewayFactory.evaluate(CONTRACT_PREFIX + ":FindMintRecordByVisit", visitId);
        return parseOrNull(result, FabricNftMintRecord.class);
    }

    /**
     * mint 성공 후 Fabric 기록 실패 케이스를 사후 복구한다.
     * (MINTED_BUT_FABRIC_RECORD_FAILED 상태 복구용)
     */
    public void reconcileNFTMintFailure(
            String mintRecordId,
            String visitId,
            String draftId,
            String userIdHash,
            String tokenId,
            String ownerAddress,
            String imageCid,
            String metadataCid,
            String polygonTxHash,
            String mintedAt
    ) {
        if (!gatewayFactory.isAvailable()) {
            log.warn("[FabricNftGateway] Fabric not available — ReconcileNFTMintFailure skipped. mintRecordId={}", mintRecordId);
            return;
        }

        gatewayFactory.submit(
                CONTRACT_PREFIX + ":ReconcileNFTMintFailure",
                mintRecordId, visitId, draftId != null ? draftId : "",
                userIdHash, tokenId, ownerAddress,
                imageCid, metadataCid, polygonTxHash, mintedAt
        );
        log.info("[FabricNftGateway] ReconcileNFTMintFailure committed. mintRecordId={}", mintRecordId);
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private <T> T parseOrNull(byte[] bytes, Class<T> type) {
        if (bytes == null || bytes.length == 0) return null;
        try {
            return objectMapper.readValue(bytes, type);
        } catch (IOException e) {
            log.warn("[FabricNftGateway] Failed to parse Fabric response. type={} error={}", type.getSimpleName(), e.getMessage());
            return null;
        }
    }
}
