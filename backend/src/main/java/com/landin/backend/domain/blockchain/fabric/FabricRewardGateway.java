package com.landin.backend.domain.blockchain.fabric;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.landin.backend.domain.blockchain.fabric.dto.FabricRewardEntry;
import com.landin.backend.domain.blockchain.fabric.dto.FabricRewardLedger;
import com.landin.backend.domain.blockchain.fabric.dto.FabricVisitRecord;
import com.landin.backend.domain.blockchain.fabric.dto.FabricNftMintRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * visitledger RewardContract / QueryContract 함수 호출 담당.
 *
 * <ul>
 *   <li>GrantPointAfterNFTMint - NFT 발급 완료 후 포인트 적립 (submitTransaction)</li>
 *   <li>UsePoint - 포인트 사용 (submitTransaction)</li>
 *   <li>GetPointBalance - 포인트 잔액 조회 (evaluateTransaction)</li>
 *   <li>GetVisitHistoryByUser - 방문 이력 조회 (evaluateTransaction)</li>
 *   <li>GetMintHistoryByUser - NFT 발급 이력 조회 (evaluateTransaction)</li>
 *   <li>GetRewardHistoryByUser - 포인트 이력 조회 (evaluateTransaction)</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FabricRewardGateway {

    private static final String REWARD_CONTRACT = "RewardContract";
    private static final String QUERY_CONTRACT = "QueryContract";

    private final FabricGatewayFactory gatewayFactory;
    private final ObjectMapper objectMapper;

    /**
     * NFT 발급 기록 완료 후 포인트를 적립한다.
     *
     * <p>선행 조건: Fabric 원장에 mintRecordId가 존재해야 함 (체인코드 내부에서 검증).
     * Fabric 미연결 시 FabricException을 던진다.
     *
     * @param rewardTxId   포인트 지급 트랜잭션 ID (DB nft_mint_requests.id 재사용 가능)
     * @param visitId      Fabric 원장의 visitId
     * @param mintRecordId Fabric 원장의 mintRecordId
     * @param userIdHash   userId SHA-256 해시
     * @param campaignId   캠페인 ID
     * @param pointAmount  지급 포인트 양
     * @param grantedAt    지급 시각 (RFC3339)
     * @return fabricTxId (체인코드 응답, 빈 문자열 가능)
     */
    public String grantPointAfterNFTMint(
            String rewardTxId,
            String visitId,
            String mintRecordId,
            String userIdHash,
            String campaignId,
            int pointAmount,
            String grantedAt
    ) {
        if (!gatewayFactory.isAvailable()) {
            log.warn("[FabricRewardGateway] Fabric not available — GrantPointAfterNFTMint skipped. rewardTxId={}", rewardTxId);
            return null;
        }

        try {
            byte[] result = gatewayFactory.submit(
                    REWARD_CONTRACT + ":GrantPointAfterNFTMint",
                    rewardTxId, visitId, mintRecordId,
                    userIdHash, campaignId,
                    String.valueOf(pointAmount),
                    grantedAt
            );
            log.info("[FabricRewardGateway] GrantPointAfterNFTMint committed. rewardTxId={}, points={}", rewardTxId, pointAmount);
            return result != null ? new String(result) : "";
        } catch (FabricException e) {
            log.error("[FabricRewardGateway] GrantPointAfterNFTMint failed. rewardTxId={} error={}", rewardTxId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 가맹점에서 포인트를 사용한다.
     *
     * @param rewardUseTxId 포인트 사용 트랜잭션 ID
     * @param userIdHash    userId SHA-256 해시
     * @param partnerId     가맹점 ID
     * @param pointAmount   사용 포인트 양
     * @param usedAt        사용 시각 (RFC3339)
     */
    public void usePoint(
            String rewardUseTxId,
            String userIdHash,
            String partnerId,
            int pointAmount,
            String usedAt
    ) {
        if (!gatewayFactory.isAvailable()) {
            log.warn("[FabricRewardGateway] Fabric not available — UsePoint skipped. rewardUseTxId={}", rewardUseTxId);
            return;
        }

        try {
            gatewayFactory.submit(
                    REWARD_CONTRACT + ":UsePoint",
                    rewardUseTxId, userIdHash, partnerId,
                    String.valueOf(pointAmount), usedAt
            );
            log.info("[FabricRewardGateway] UsePoint committed. rewardUseTxId={}, points={}", rewardUseTxId, pointAmount);
        } catch (FabricException e) {
            log.error("[FabricRewardGateway] UsePoint failed. rewardUseTxId={} error={}", rewardUseTxId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 사용자의 현재 포인트 잔액을 조회한다.
     *
     * @return FabricRewardLedger, 또는 Fabric 미연결 시 null
     */
    public FabricRewardLedger getPointBalance(String userIdHash) {
        byte[] result = gatewayFactory.evaluate(REWARD_CONTRACT + ":GetPointBalance", userIdHash);
        return parseOrNull(result, FabricRewardLedger.class);
    }

    /**
     * 사용자의 방문 이력 전체를 조회한다.
     */
    public List<FabricVisitRecord> getVisitHistory(String userIdHash) {
        byte[] result = gatewayFactory.evaluate(QUERY_CONTRACT + ":GetVisitHistoryByUser", userIdHash);
        return parseListOrEmpty(result, FabricVisitRecord.class);
    }

    /**
     * 사용자의 NFT 발급 이력 전체를 조회한다.
     */
    public List<FabricNftMintRecord> getMintHistory(String userIdHash) {
        byte[] result = gatewayFactory.evaluate(QUERY_CONTRACT + ":GetMintHistoryByUser", userIdHash);
        return parseListOrEmpty(result, FabricNftMintRecord.class);
    }

    /**
     * 사용자의 포인트 적립/사용 이력 전체를 조회한다.
     */
    public List<FabricRewardEntry> getRewardHistory(String userIdHash) {
        byte[] result = gatewayFactory.evaluate(QUERY_CONTRACT + ":GetRewardHistoryByUser", userIdHash);
        return parseListOrEmpty(result, FabricRewardEntry.class);
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private <T> T parseOrNull(byte[] bytes, Class<T> type) {
        if (bytes == null || bytes.length == 0) return null;
        try {
            return objectMapper.readValue(bytes, type);
        } catch (IOException e) {
            log.warn("[FabricRewardGateway] Failed to parse response. type={} error={}", type.getSimpleName(), e.getMessage());
            return null;
        }
    }

    private <T> List<T> parseListOrEmpty(byte[] bytes, Class<T> elementType) {
        if (bytes == null || bytes.length == 0) return Collections.emptyList();
        try {
            return objectMapper.readValue(bytes,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, elementType));
        } catch (IOException e) {
            log.warn("[FabricRewardGateway] Failed to parse list response. type={} error={}", elementType.getSimpleName(), e.getMessage());
            return Collections.emptyList();
        }
    }
}
