package com.landin.backend.domain.blockchain.fabric;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.landin.backend.domain.blockchain.fabric.dto.FabricVisitRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.format.DateTimeFormatter;

/**
 * visitledger VisitContract 함수 호출 담당.
 *
 * <ul>
 *   <li>VerifyVisit - NFC 방문 인증 원장 기록 (submitTransaction)</li>
 *   <li>GetVisit - 방문 레코드 조회 (evaluateTransaction)</li>
 *   <li>HasRecentVisit - 24시간 쿨다운 확인 (evaluateTransaction)</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FabricVisitGateway {

    private static final String CONTRACT_PREFIX = "VisitContract";
    private static final DateTimeFormatter RFC3339 = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    private final FabricGatewayFactory gatewayFactory;
    private final ObjectMapper objectMapper;

    /**
     * NFC SUN/SDM 검증 성공 후 방문 인증을 Fabric 원장에 기록한다.
     *
     * <p>Fabric 미연결 시 경고 로그 후 건너뜀 (MVP 정책: Fabric 없이 방문 인증 허용).
     *
     * @param visitId       Spring Boot에서 생성한 방문 UUID
     * @param userIdHash    userId SHA-256 해시
     * @param campaignId    캠페인 ID
     * @param tagIdHash     NFC tagUid SHA-256 해시
     * @param visitProofHash SUN/SDM MAC 해시
     * @param visitedAt     방문 시각 (RFC3339)
     * @param locationCode  랜드마크 코드
     */
    public void verifyVisit(
            String visitId,
            String userIdHash,
            String campaignId,
            String tagIdHash,
            String visitProofHash,
            String visitedAt,
            String locationCode
    ) {
        if (!gatewayFactory.isAvailable()) {
            log.warn("[FabricVisitGateway] Fabric not available — VerifyVisit skipped. visitId={}", visitId);
            return;
        }

        try {
            gatewayFactory.submit(
                    CONTRACT_PREFIX + ":VerifyVisit",
                    visitId, userIdHash, campaignId, tagIdHash, visitProofHash, visitedAt, locationCode
            );
            log.info("[FabricVisitGateway] VerifyVisit committed. visitId={}", visitId);
        } catch (FabricException e) {
            log.error("[FabricVisitGateway] VerifyVisit failed. visitId={} error={}", visitId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * visitId로 Fabric 원장에서 방문 레코드를 조회한다.
     *
     * @return FabricVisitRecord, 또는 Fabric 미연결/레코드 없음 시 null
     */
    public FabricVisitRecord getVisit(String visitId) {
        byte[] result = gatewayFactory.evaluate(CONTRACT_PREFIX + ":GetVisit", visitId);
        return parseOrNull(result, FabricVisitRecord.class);
    }

    /**
     * 동일 사용자+태그에 대해 24시간 이내 방문 기록 여부를 확인한다.
     *
     * @return true = 쿨다운 중, false = 방문 가능 (Fabric 미연결 시 false 반환)
     */
    public boolean hasRecentVisit(String userIdHash, String tagIdHash) {
        byte[] result = gatewayFactory.evaluate(CONTRACT_PREFIX + ":HasRecentVisit", userIdHash, tagIdHash);
        if (result == null || result.length == 0) return false;
        return "true".equalsIgnoreCase(new String(result).trim());
    }

    // ─── helpers ───────────────────────────────────────────────────────────

    private <T> T parseOrNull(byte[] bytes, Class<T> type) {
        if (bytes == null || bytes.length == 0) return null;
        try {
            return objectMapper.readValue(bytes, type);
        } catch (IOException e) {
            log.warn("[FabricVisitGateway] Failed to parse Fabric response. type={} error={}", type.getSimpleName(), e.getMessage());
            return null;
        }
    }
}
