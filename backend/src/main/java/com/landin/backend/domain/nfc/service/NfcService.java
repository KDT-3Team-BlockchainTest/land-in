package com.landin.backend.domain.nfc.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.config.NfcProperties;
import com.landin.backend.domain.blockchain.fabric.FabricVisitGateway;
import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import com.landin.backend.domain.nfc.dto.NfcVerifyRequest;
import com.landin.backend.domain.nfc.dto.NfcVerifyResponse;
import com.landin.backend.domain.nfc.entity.NfcScanLog;
import com.landin.backend.domain.nfc.entity.NfcScanResult;
import com.landin.backend.domain.nfc.repository.NfcScanLogRepository;
import com.landin.backend.domain.nft.dto.UserNftResponse;
import com.landin.backend.domain.nft.entity.UserNft;
import com.landin.backend.domain.nft.repository.UserNftRepository;
import com.landin.backend.domain.nft.service.OnChainNftMintService;
import com.landin.backend.domain.participation.repository.EventParticipationRepository;
import com.landin.backend.domain.reward.dto.UserRewardResponse;
import com.landin.backend.domain.reward.entity.RewardStatus;
import com.landin.backend.domain.reward.entity.RewardTemplate;
import com.landin.backend.domain.reward.entity.UserReward;
import com.landin.backend.domain.reward.repository.RewardTemplateRepository;
import com.landin.backend.domain.reward.repository.UserRewardRepository;
import com.landin.backend.domain.step.entity.NfcTag;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import com.landin.backend.domain.step.entity.StepCompletion;
import com.landin.backend.domain.step.repository.NfcTagRepository;
import com.landin.backend.domain.step.repository.NftTemplateRepository;
import com.landin.backend.domain.step.repository.StepCompletionRepository;
import com.landin.backend.domain.step.repository.StepRepository;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NfcService {

    private static final DateTimeFormatter RFC3339 = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final NfcTagRepository nfcTagRepository;
    private final StepRepository stepRepository;
    private final StepCompletionRepository stepCompletionRepository;
    private final NftTemplateRepository nftTemplateRepository;
    private final UserNftRepository userNftRepository;
    private final EventParticipationRepository participationRepository;
    private final RewardTemplateRepository rewardTemplateRepository;
    private final UserRewardRepository userRewardRepository;
    private final NfcScanLogRepository nfcScanLogRepository;
    private final UserRepository userRepository;
    private final OnChainNftMintService onChainNftMintService;
    private final FabricVisitGateway fabricVisitGateway;
    private final SunSdmVerifier sunSdmVerifier;
    private final NfcProperties nfcProperties;

    @Transactional
    public NfcVerifyResponse verify(UUID userId, NfcVerifyRequest request) {
        Objects.requireNonNull(userId, "User id must not be null");

        // ── Step 1: tagUid 결정 (SUN/SDM 모드 또는 레거시 모드) ──────────────────
        final String tagUid;
        final Integer sdmCounter;

        if (request.hasSdmData()) {
            // SUN/SDM 모드: piccData 복호화 → UID + 카운터 추출 + CMAC 검증
            if (!nfcProperties.getSdm().isConfigured()) {
                log.error("[NfcService] SUN/SDM 요청이 왔으나 서버에 SDM 키 미설정. userId={}", userId);
                throw new BusinessException(ErrorCode.SUN_NOT_CONFIGURED);
            }
            if (request.getCmac() == null || request.getCmac().isBlank()) {
                throw new BusinessException(ErrorCode.SUN_PICC_INVALID);
            }
            SunSdmVerifier.SunSdmResult sdmResult = sunSdmVerifier.verify(
                    request.getPiccData(), request.getCmac(),
                    nfcProperties.getSdm().getEncKey(), nfcProperties.getSdm().getMacKey());
            tagUid = sdmResult.tagUid();
            sdmCounter = sdmResult.counter();
            log.info("[NfcService] SUN/SDM 모드 요청. userId={}, tagUid={}, counter={}", userId, tagUid, sdmCounter);
        } else {
            // 레거시 모드: 앱이 직접 tagUid 전송
            if (request.getTagUid() == null || request.getTagUid().isBlank()) {
                throw new BusinessException(ErrorCode.UNKNOWN_TAG);
            }
            tagUid = normalizeTagUid(request.getTagUid());
            sdmCounter = null;
            log.info("[NfcService] 레거시 모드 요청. userId={}, tagUid={}", userId, tagUid);
        }

        User user = Objects.requireNonNull(
                userRepository.getReferenceById(userId),
                "User reference must not be null"
        );

        // ── Step 2: 태그 조회 및 활성 상태 확인 ────────────────────────────────
        NfcTag nfcTag = nfcTagRepository.findByTagUid(tagUid).orElse(null);
        if (nfcTag == null) {
            log.warn("[NfcService] 등록되지 않은 태그. userId={}, tagUid={}", userId, tagUid);
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.UNKNOWN_TAG);
        }
        if (!nfcTag.isActive()) {
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.TAG_INACTIVE);
        }

        // ── Step 3: SUN/SDM 재전송 공격 방지 (카운터 단조 증가 확인) ────────────
        if (sdmCounter != null) {
            if (sdmCounter <= nfcTag.getLastNfcCounter()) {
                log.warn("[NfcService] NFC 카운터 재사용 감지. userId={}, tagUid={}, counter={}, lastCounter={}",
                        userId, tagUid, sdmCounter, nfcTag.getLastNfcCounter());
                saveLog(user, tagUid, NfcScanResult.COUNTER_REPLAY);
                throw new BusinessException(ErrorCode.SUN_COUNTER_REPLAY);
            }
            nfcTag.updateNfcCounter(sdmCounter);
        }

        Step step = nfcTag.getStep();
        Event event = step.getEvent();

        if (Objects.requireNonNull(event.getStatus(), "Event status must not be null") != EventStatus.ACTIVE) {
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.EVENT_NOT_JOINABLE);
        }

        if (!participationRepository.existsByUserIdAndEventId(userId, event.getId())) {
            saveLog(user, tagUid, NfcScanResult.NOT_JOINED);
            throw new BusinessException(ErrorCode.NOT_JOINED);
        }

        if (stepCompletionRepository.existsByUserIdAndStepId(userId, step.getId())) {
            saveLog(user, tagUid, NfcScanResult.ALREADY_DONE);
            throw new BusinessException(ErrorCode.STEP_ALREADY_DONE);
        }

        if (step.getOrderIndex() > 1) {
            List<Step> stepsInOrder = stepRepository.findByEventIdOrderByOrderIndex(event.getId());
            Optional<Step> previousStep = stepsInOrder.stream()
                    .filter(candidate -> candidate.getOrderIndex() == step.getOrderIndex() - 1)
                    .findFirst();
            if (previousStep.isPresent() && !stepCompletionRepository.existsByUserIdAndStepId(userId, previousStep.get().getId())) {
                saveLog(user, tagUid, NfcScanResult.WRONG_ORDER);
                throw new BusinessException(ErrorCode.WRONG_ORDER);
            }
        }

        StepCompletion completion = Objects.requireNonNull(
                StepCompletion.builder()
                        .user(user)
                        .step(step)
                        .completedAt(LocalDateTime.now())
                        .build(),
                "Step completion must not be null"
        );
        Objects.requireNonNull(stepCompletionRepository.save(completion), "Saved step completion must not be null");

        recordVisitOnFabric(userId, tagUid, event, step, completion);

        NftTemplate template = nftTemplateRepository.findByStepId(step.getId())
                .orElseThrow(() -> new IllegalStateException("NFT template is missing. stepId=" + step.getId()));

        UserNft userNft = Objects.requireNonNull(
                UserNft.builder()
                        .user(user)
                        .step(step)
                        .event(event)
                        .nftTemplate(template)
                        .name(template.getName())
                        .imageUrl(template.getImageUrl())
                        .rarity(template.getRarity())
                        .mintedAt(LocalDateTime.now())
                        .build(),
                "User NFT must not be null"
        );
        userNft = Objects.requireNonNull(userNftRepository.save(userNft), "Saved user NFT must not be null");
        onChainNftMintService.prepareMintState(userNft);
        onChainNftMintService.scheduleMintAfterCommit(Objects.requireNonNull(userNft.getId(), "Saved user NFT id must not be null"));

        saveLog(user, tagUid, NfcScanResult.SUCCESS);
        UserReward issuedReward = checkAndIssueReward(userId, user, event);

        return NfcVerifyResponse.builder()
                .mintedNft(UserNftResponse.from(userNft))
                .rewardIssued(issuedReward != null)
                .reward(issuedReward != null ? UserRewardResponse.from(issuedReward) : null)
                .build();
    }

    private UserReward checkAndIssueReward(UUID userId, User user, Event event) {
        long totalSteps = stepRepository.countByEventId(event.getId());
        long completedSteps = stepCompletionRepository.countByUserIdAndStepEventId(userId, event.getId());

        if (completedSteps < totalSteps) {
            return null;
        }

        if (userRewardRepository.existsByUserIdAndEventId(userId, event.getId())) {
            return null;
        }

        Optional<RewardTemplate> templateOpt = rewardTemplateRepository.findByEventId(event.getId());
        if (templateOpt.isEmpty()) {
            log.warn("Reward template missing. eventId={}", event.getId());
            return null;
        }

        RewardTemplate template = templateOpt.get();
        LocalDateTime now = LocalDateTime.now();

        UserReward reward = Objects.requireNonNull(
                UserReward.builder()
                        .user(user)
                        .event(event)
                        .rewardTemplate(template)
                        .couponCode(generateCouponCode())
                        .status(RewardStatus.AVAILABLE)
                        .issuedAt(now)
                        .validUntil(now.toLocalDate().plusDays(template.getValidityDays()))
                        .build(),
                "Reward must not be null"
        );

        return Objects.requireNonNull(userRewardRepository.save(reward), "Saved reward must not be null");
    }

    private void saveLog(User user, String tagUid, NfcScanResult result) {
        NfcScanLog scanLog = Objects.requireNonNull(
                NfcScanLog.builder()
                        .user(user)
                        .tagUid(tagUid)
                        .scannedAt(LocalDateTime.now())
                        .result(result)
                        .build(),
                "Scan log must not be null"
        );
        Objects.requireNonNull(nfcScanLogRepository.save(scanLog), "Saved scan log must not be null");
    }

    private String generateCouponCode() {
        return "LI-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private void recordVisitOnFabric(UUID userId, String tagUid, Event event, Step step, StepCompletion completion) {
        try {
            String visitId = completion.getId().toString();
            String userIdHash = sha256Hex(userId.toString());
            String tagIdHash = sha256Hex(tagUid);
            String visitProofHash = sha256Hex(userId + ":" + tagUid + ":" + visitId);
            String visitedAt = completion.getCompletedAt().atOffset(ZoneOffset.UTC).format(RFC3339);
            String locationCode = step.getPlaceName();
            fabricVisitGateway.verifyVisit(visitId, userIdHash, event.getId(), tagIdHash, visitProofHash, visitedAt, locationCode);
        } catch (Exception e) {
            log.warn("[NfcService] Fabric VerifyVisit failed — continuing without Fabric record. userId={} error={}", userId, e.getMessage());
        }
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String normalizeTagUid(String rawTagValue) {
        String trimmed = rawTagValue.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }

        try {
            String queryTagUid = UriComponentsBuilder.fromUriString(trimmed)
                    .build()
                    .getQueryParams()
                    .getFirst("tagUid");

            if (queryTagUid != null && !queryTagUid.isBlank()) {
                return queryTagUid.trim().toUpperCase();
            }
        } catch (IllegalArgumentException ignored) {
            // Not a valid URI. Fall back to the raw tag value.
        }

        return trimmed.toUpperCase();
    }
}
