package com.landin.backend.domain.nfc.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NfcService {

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

    @Transactional
    public NfcVerifyResponse verify(UUID userId, NfcVerifyRequest request) {
        String rawTagValue = Objects.requireNonNull(request.getTagUid(), "Tag UID must not be null");
        String tagUid = normalizeTagUid(rawTagValue);
        User user = Objects.requireNonNull(
                userRepository.getReferenceById(Objects.requireNonNull(userId, "User id must not be null")),
                "User reference must not be null"
        );

        log.info("[NfcService] verify request received. userId={}, rawTagValue={}, normalizedTagUid={}", userId, rawTagValue, tagUid);

        NfcTag nfcTag = nfcTagRepository.findByTagUid(tagUid).orElse(null);
        if (nfcTag == null) {
            log.warn("[NfcService] unknown tag. userId={}, rawTagValue={}, normalizedTagUid={}", userId, rawTagValue, tagUid);
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.UNKNOWN_TAG);
        }
        if (!nfcTag.isActive()) {
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.TAG_INACTIVE);
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
        onChainNftMintService.syncMintState(userNft);

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
