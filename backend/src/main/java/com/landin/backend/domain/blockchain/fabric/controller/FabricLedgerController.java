package com.landin.backend.domain.blockchain.fabric.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.blockchain.fabric.FabricNftGateway;
import com.landin.backend.domain.blockchain.fabric.FabricRewardGateway;
import com.landin.backend.domain.blockchain.fabric.FabricVisitGateway;
import com.landin.backend.domain.blockchain.fabric.dto.FabricNftMintRecord;
import com.landin.backend.domain.blockchain.fabric.dto.FabricRewardEntry;
import com.landin.backend.domain.blockchain.fabric.dto.FabricRewardLedger;
import com.landin.backend.domain.blockchain.fabric.dto.FabricVisitRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Fabric 원장 직접 조회 API (관리자용)
 *
 * <pre>
 * GET /api/admin/fabric/visits/{visitId}                      - 방문 레코드 조회
 * GET /api/admin/fabric/visits/by-user/{userIdHash}           - 사용자 방문 이력
 * GET /api/admin/fabric/nfts/{mintRecordId}                   - NFT 발급 레코드 조회
 * GET /api/admin/fabric/nfts/by-visit/{visitId}               - visitId로 NFT 레코드 조회
 * GET /api/admin/fabric/nfts/by-user/{userIdHash}             - 사용자 NFT 발급 이력
 * GET /api/admin/fabric/rewards/balance/{userIdHash}          - 포인트 잔액 조회
 * GET /api/admin/fabric/rewards/history/{userIdHash}          - 포인트 이력 조회
 * </pre>
 */
@RestController
@RequestMapping("/api/admin/fabric")
@RequiredArgsConstructor
public class FabricLedgerController {

    private final FabricVisitGateway fabricVisitGateway;
    private final FabricNftGateway fabricNftGateway;
    private final FabricRewardGateway fabricRewardGateway;

    // ─── Visit ───────────────────────────────────────────────────────────────

    @GetMapping("/visits/{visitId}")
    public ResponseEntity<ApiResponse<FabricVisitRecord>> getVisit(@PathVariable String visitId) {
        return ResponseEntity.ok(ApiResponse.ok(fabricVisitGateway.getVisit(visitId)));
    }

    @GetMapping("/visits/by-user/{userIdHash}")
    public ResponseEntity<ApiResponse<List<FabricVisitRecord>>> getVisitHistory(@PathVariable String userIdHash) {
        return ResponseEntity.ok(ApiResponse.ok(fabricRewardGateway.getVisitHistory(userIdHash)));
    }

    // ─── NFT ─────────────────────────────────────────────────────────────────

    @GetMapping("/nfts/{mintRecordId}")
    public ResponseEntity<ApiResponse<FabricNftMintRecord>> getNftRecord(@PathVariable String mintRecordId) {
        return ResponseEntity.ok(ApiResponse.ok(fabricNftGateway.getNftMintRecord(mintRecordId)));
    }

    @GetMapping("/nfts/by-visit/{visitId}")
    public ResponseEntity<ApiResponse<FabricNftMintRecord>> getNftByVisit(@PathVariable String visitId) {
        return ResponseEntity.ok(ApiResponse.ok(fabricNftGateway.findMintRecordByVisit(visitId)));
    }

    @GetMapping("/nfts/by-user/{userIdHash}")
    public ResponseEntity<ApiResponse<List<FabricNftMintRecord>>> getMintHistory(@PathVariable String userIdHash) {
        return ResponseEntity.ok(ApiResponse.ok(fabricRewardGateway.getMintHistory(userIdHash)));
    }

    // ─── Reward ──────────────────────────────────────────────────────────────

    @GetMapping("/rewards/balance/{userIdHash}")
    public ResponseEntity<ApiResponse<FabricRewardLedger>> getBalance(@PathVariable String userIdHash) {
        return ResponseEntity.ok(ApiResponse.ok(fabricRewardGateway.getPointBalance(userIdHash)));
    }

    @GetMapping("/rewards/history/{userIdHash}")
    public ResponseEntity<ApiResponse<List<FabricRewardEntry>>> getRewardHistory(@PathVariable String userIdHash) {
        return ResponseEntity.ok(ApiResponse.ok(fabricRewardGateway.getRewardHistory(userIdHash)));
    }
}
