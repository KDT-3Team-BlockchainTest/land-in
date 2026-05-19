package com.landin.backend.domain.nft.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.blockchain.fabric.FabricException;
import com.landin.backend.domain.blockchain.fabric.FabricNftGateway;
import com.landin.backend.domain.blockchain.fabric.FabricRewardGateway;
import com.landin.backend.domain.nft.dto.GrantRewardResponse;
import com.landin.backend.domain.nft.dto.MintPolygonRequest;
import com.landin.backend.domain.nft.dto.MintRequestResponse;
import com.landin.backend.domain.nft.entity.NftMintRequest;
import com.landin.backend.domain.nft.entity.NftMintRequestStatus;
import com.landin.backend.domain.nft.repository.NftMintRequestRepository;
import com.landin.backend.domain.photodraft.entity.PhotoDraft;
import com.landin.backend.domain.photodraft.entity.PhotoDraftStatus;
import com.landin.backend.domain.photodraft.repository.PhotoDraftRepository;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.codec.Hex;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * NFT 민팅 요청 서비스.
 *
 * <p>처리 순서 (기획서 4.1 플로우):
 * <ol>
 *   <li>IPFS 업로드 — PhotoDraftService.prepareIpfs()</li>
 *   <li>Polygon ERC-721 mint — mintPolygon() (현재 stub)</li>
 *   <li>Fabric RecordNFTMint — mintPolygon() 내부에서 연속 호출</li>
 *   <li>포인트 지급 — grantReward()</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NftMintRequestService {

    private static final int DEFAULT_POINT_AMOUNT = 100;
    private static final DateTimeFormatter RFC3339 = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final NftMintRequestRepository mintRequestRepository;
    private final PhotoDraftRepository photoDraftRepository;
    private final UserRepository userRepository;
    private final FabricNftGateway fabricNftGateway;
    private final FabricRewardGateway fabricRewardGateway;

    /**
     * Polygon mint를 요청하고, 성공 시 Fabric에 NFT 발급 기록을 남긴다.
     *
     * <p>실패 케이스별 처리 (기획서 5.3):
     * <ul>
     *   <li>Polygon mint 실패 → POLYGON_MINT_FAILED, 포인트 미지급</li>
     *   <li>mint 성공 + Fabric 기록 실패 → MINTED_BUT_FABRIC_RECORD_FAILED</li>
     * </ul>
     */
    @Transactional
    public MintRequestResponse mintPolygon(UUID userId, UUID draftId, MintPolygonRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        PhotoDraft draft = photoDraftRepository.findByIdAndUserId(draftId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PHOTO_DRAFT_NOT_FOUND));

        if (draft.getStatus() != PhotoDraftStatus.SELECTED_FOR_MINT
                && draft.getStatus() != PhotoDraftStatus.READY_FOR_IPFS) {
            throw new BusinessException(ErrorCode.DRAFT_NOT_READY_FOR_IPFS);
        }

        if (mintRequestRepository.existsByDraftId(draftId)) {
            throw new BusinessException(ErrorCode.DUPLICATE_NFT_MINT);
        }

        String walletAddress = request.getWalletAddress();

        // TODO: 실제 IPFS CID는 IPFS 업로드 완료 후 DB에서 조회
        String imageCid = "QmImageCid-" + draftId; // stub
        String metadataCid = "QmMetadataCid-" + draftId; // stub
        String tokenUri = "ipfs://" + metadataCid;

        NftMintRequest mintReq = NftMintRequest.builder()
                .user(user)
                .draft(draft)
                .visitId(draft.getVisitId())
                .mintStatus(NftMintRequestStatus.POLYGON_MINT_REQUESTED)
                .imageCid(imageCid)
                .metadataCid(metadataCid)
                .tokenUri(tokenUri)
                .ownerWalletAddress(walletAddress)
                .build();

        mintReq = mintRequestRepository.save(mintReq);
        log.info("[NftMintRequestService] Polygon mint requested. mintRequestId={}, visitId={}", mintReq.getId(), mintReq.getVisitId());

        // TODO: 실제 Polygon mint 호출 (OnChainNftMintService / Web3j)
        // 현재는 stub: 테스트용 txHash/tokenId
        String mockTxHash = "0x" + hashOf(mintReq.getId().toString());
        String mockTokenId = String.valueOf(Math.abs(mintReq.getId().hashCode()) % 1_000_000);

        mintReq.markPolygonMinted(mockTxHash, mockTokenId);
        mintReq.markFabricRecordPending();

        // Fabric RecordNFTMint 호출
        String mintedAt = LocalDateTime.now(ZoneOffset.UTC).format(RFC3339);
        String userIdHash = hashOf(userId.toString());

        try {
            fabricNftGateway.recordNFTMint(
                    mintReq.getId().toString(),
                    mintReq.getVisitId(),
                    draftId.toString(),
                    userIdHash,
                    mockTokenId,
                    walletAddress,
                    imageCid,
                    metadataCid,
                    mockTxHash,
                    mintedAt
            );
            mintReq.markFabricRecorded(null);
            log.info("[NftMintRequestService] Fabric RecordNFTMint completed. mintRequestId={}", mintReq.getId());
        } catch (FabricException e) {
            mintReq.markMintedButFabricFailed(e.getMessage());
            log.error("[NftMintRequestService] Fabric RecordNFTMint failed — MINTED_BUT_FABRIC_RECORD_FAILED. mintRequestId={}", mintReq.getId(), e);
        }

        return MintRequestResponse.from(mintRequestRepository.save(mintReq));
    }

    /**
     * mint 요청 상태를 폴링한다.
     */
    @Transactional(readOnly = true)
    public MintRequestResponse getStatus(UUID userId, UUID mintRequestId) {
        NftMintRequest req = mintRequestRepository.findByIdAndUserId(mintRequestId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NFT_MINT_REQUEST_NOT_FOUND));
        return MintRequestResponse.from(req);
    }

    /**
     * NFT 발급 완료 후 포인트를 지급한다.
     * Fabric GrantPointAfterNFTMint를 호출한다.
     *
     * <p>선행 조건: FABRIC_RECORDED 상태여야 포인트 지급 가능.
     * 실패 시 REWARD_FAILED_AFTER_MINT 상태로 저장하고 서버 재시도 큐에 편입된다.
     */
    @Transactional
    public GrantRewardResponse grantReward(UUID userId, UUID mintRequestId) {
        NftMintRequest req = mintRequestRepository.findByIdAndUserId(mintRequestId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NFT_MINT_REQUEST_NOT_FOUND));

        if (req.getMintStatus() != NftMintRequestStatus.FABRIC_RECORDED
                && req.getMintStatus() != NftMintRequestStatus.REWARD_FAILED_AFTER_MINT) {
            throw new BusinessException(ErrorCode.MINT_NOT_READY_FOR_REWARD);
        }

        req.markRewardPending();

        // mintRequestId를 rewardTxId로 재사용 — Fabric 체인코드에서 멱등성 보장
        String rewardTxId = req.getId().toString();
        String userIdHash = hashOf(userId.toString());
        String grantedAt = LocalDateTime.now(ZoneOffset.UTC).format(RFC3339);

        try {
            String fabricResult = fabricRewardGateway.grantPointAfterNFTMint(
                    rewardTxId,
                    req.getVisitId(),
                    req.getId().toString(),
                    userIdHash,
                    "default-campaign", // TODO: step/event에서 campaignId 추출
                    DEFAULT_POINT_AMOUNT,
                    grantedAt
            );

            req.markRewardGranted();
            req.markCompleted();
            mintRequestRepository.save(req);
            log.info("[NftMintRequestService] GrantPointAfterNFTMint completed. mintRequestId={}, points={}", req.getId(), DEFAULT_POINT_AMOUNT);

            return GrantRewardResponse.builder()
                    .pointAmount(DEFAULT_POINT_AMOUNT)
                    .rewardTxId(rewardTxId)
                    .fabricTxId(fabricResult)
                    .mintStatus(req.getMintStatus().name())
                    .build();

        } catch (FabricException e) {
            req.markRewardFailedAfterMint(e.getMessage());
            mintRequestRepository.save(req);
            log.error("[NftMintRequestService] GrantPointAfterNFTMint failed — REWARD_FAILED_AFTER_MINT. mintRequestId={}", req.getId(), e);
            throw new BusinessException(ErrorCode.FABRIC_REWARD_FAILED);
        }
    }

    /**
     * 관리자 수동 재시도 — MINTED_BUT_FABRIC_RECORD_FAILED 복구.
     */
    @Transactional
    public MintRequestResponse adminRetry(UUID mintRequestId) {
        NftMintRequest req = mintRequestRepository.findById(mintRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NFT_MINT_REQUEST_NOT_FOUND));

        if (req.getMintStatus() == NftMintRequestStatus.MINTED_BUT_FABRIC_RECORD_FAILED) {
            String userIdHash = hashOf(req.getUser().getId().toString());
            String mintedAt = LocalDateTime.now(ZoneOffset.UTC).format(RFC3339);

            try {
                fabricNftGateway.reconcileNFTMintFailure(
                        req.getId().toString(),
                        req.getVisitId(),
                        req.getDraft() != null ? req.getDraft().getId().toString() : "",
                        userIdHash,
                        req.getPolygonTokenId(),
                        req.getOwnerWalletAddress(),
                        req.getImageCid() != null ? req.getImageCid() : "",
                        req.getMetadataCid() != null ? req.getMetadataCid() : "",
                        req.getPolygonTxHash(),
                        mintedAt
                );
                req.markFabricRecorded(null);
                log.info("[NftMintRequestService] Admin reconcile succeeded. mintRequestId={}", mintRequestId);
            } catch (FabricException e) {
                log.error("[NftMintRequestService] Admin reconcile failed. mintRequestId={}", mintRequestId, e);
                throw new BusinessException(ErrorCode.FABRIC_NFT_RECORD_FAILED);
            }
        }

        return MintRequestResponse.from(mintRequestRepository.save(req));
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private String hashOf(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return new String(Hex.encode(hash));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
