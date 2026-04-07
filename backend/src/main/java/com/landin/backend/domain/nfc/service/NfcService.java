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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

    @Transactional
    public NfcVerifyResponse verify(UUID userId, NfcVerifyRequest request) {
        String tagUid = request.getTagUid();
        User user = userRepository.getReferenceById(userId);

        // 1. 태그 조회
        NfcTag nfcTag = nfcTagRepository.findByTagUid(tagUid).orElse(null);
        if (nfcTag == null) {
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.UNKNOWN_TAG);
        }
        if (!nfcTag.isActive()) {
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.TAG_INACTIVE);
        }

        Step step = nfcTag.getStep();
        Event event = step.getEvent();

        // 2. 이벤트 상태 확인 (active or featured)
        if (event.getStatus() != EventStatus.ACTIVE) {
            saveLog(user, tagUid, NfcScanResult.UNKNOWN_TAG);
            throw new BusinessException(ErrorCode.EVENT_NOT_JOINABLE);
        }

        // 3. 참여 여부 확인
        if (!participationRepository.existsByUserIdAndEventId(userId, event.getId())) {
            saveLog(user, tagUid, NfcScanResult.NOT_JOINED);
            throw new BusinessException(ErrorCode.NOT_JOINED);
        }

        // 4. 이미 완료한 스텝인지 확인
        if (stepCompletionRepository.existsByUserIdAndStepId(userId, step.getId())) {
            saveLog(user, tagUid, NfcScanResult.ALREADY_DONE);
            throw new BusinessException(ErrorCode.STEP_ALREADY_DONE);
        }

        // 5. 순서 확인 (이전 스텝이 완료됐는지)
        if (step.getOrderIndex() > 1) {
            List<Step> stepsInOrder = stepRepository.findByEventIdOrderByOrderIndex(event.getId());
            Optional<Step> prevStep = stepsInOrder.stream()
                    .filter(s -> s.getOrderIndex() == step.getOrderIndex() - 1)
                    .findFirst();
            if (prevStep.isPresent() && !stepCompletionRepository.existsByUserIdAndStepId(userId, prevStep.get().getId())) {
                saveLog(user, tagUid, NfcScanResult.WRONG_ORDER);
                throw new BusinessException(ErrorCode.WRONG_ORDER);
            }
        }

        // 6. 스텝 완료 기록
        StepCompletion completion = StepCompletion.builder()
                .user(user)
                .step(step)
                .completedAt(LocalDateTime.now())
                .build();
        stepCompletionRepository.save(completion);

        // 7. NFT 발행 (템플릿 복사)
        NftTemplate template = nftTemplateRepository.findByStepId(step.getId())
                .orElseThrow(() -> new RuntimeException("NFT 템플릿이 없습니다. stepId=" + step.getId()));

        UserNft userNft = UserNft.builder()
                .user(user)
                .step(step)
                .event(event)
                .nftTemplate(template)
                .name(template.getName())
                .imageUrl(template.getImageUrl())
                .rarity(template.getRarity())
                .mintedAt(LocalDateTime.now())
                .build();
        userNftRepository.save(userNft);

        saveLog(user, tagUid, NfcScanResult.SUCCESS);

        // 8. 컬렉션 완료 확인 → 리워드 발급
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

        // 이미 리워드 발급됐으면 스킵 (멱등성)
        if (userRewardRepository.existsByUserIdAndEventId(userId, event.getId())) {
            return null;
        }

        Optional<RewardTemplate> templateOpt = rewardTemplateRepository.findByEventId(event.getId());
        if (templateOpt.isEmpty()) {
            log.warn("리워드 템플릿 없음. eventId={}", event.getId());
            return null;
        }

        RewardTemplate template = templateOpt.get();
        LocalDateTime now = LocalDateTime.now();

        UserReward reward = UserReward.builder()
                .user(user)
                .event(event)
                .rewardTemplate(template)
                .couponCode(generateCouponCode())
                .status(RewardStatus.AVAILABLE)
                .issuedAt(now)
                .validUntil(now.toLocalDate().plusDays(template.getValidityDays()))
                .build();

        return userRewardRepository.save(reward);
    }

    private void saveLog(User user, String tagUid, NfcScanResult result) {
        NfcScanLog log = NfcScanLog.builder()
                .user(user)
                .tagUid(tagUid)
                .scannedAt(LocalDateTime.now())
                .result(result)
                .build();
        nfcScanLogRepository.save(log);
    }

    private String generateCouponCode() {
        return "LI-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
