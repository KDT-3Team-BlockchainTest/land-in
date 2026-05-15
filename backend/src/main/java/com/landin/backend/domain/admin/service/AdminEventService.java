package com.landin.backend.domain.admin.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.admin.dto.AdminEventRequest;
import com.landin.backend.domain.admin.dto.AdminEventResponse;
import com.landin.backend.domain.admin.dto.AdminRewardRequest;
import com.landin.backend.domain.admin.dto.AdminRewardResponse;
import com.landin.backend.domain.admin.dto.AdminStepRequest;
import com.landin.backend.domain.admin.dto.AdminStepResponse;
import com.landin.backend.domain.admin.entity.Admin;
import com.landin.backend.domain.admin.repository.AdminRepository;
import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.repository.EventRepository;
import com.landin.backend.domain.participation.repository.EventParticipationRepository;
import com.landin.backend.domain.reward.entity.RewardTemplate;
import com.landin.backend.domain.reward.repository.RewardTemplateRepository;
import com.landin.backend.domain.step.entity.NfcTag;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import com.landin.backend.domain.step.repository.NfcTagRepository;
import com.landin.backend.domain.step.repository.NftTemplateRepository;
import com.landin.backend.domain.step.repository.StepCompletionRepository;
import com.landin.backend.domain.step.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminEventService {

    private final AdminRepository adminRepository;
    private final EventRepository eventRepository;
    private final StepRepository stepRepository;
    private final NfcTagRepository nfcTagRepository;
    private final NftTemplateRepository nftTemplateRepository;
    private final RewardTemplateRepository rewardTemplateRepository;
    private final EventParticipationRepository participationRepository;
    private final StepCompletionRepository stepCompletionRepository;

    @Transactional(readOnly = true)
    public List<AdminEventResponse> listEvents(UUID adminId) {
        Admin admin = requireAdmin(adminId);
        return eventRepository.findByPartnerNameOrderByCreatedAtDesc(admin.getPartnerName()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminEventResponse getEvent(UUID adminId, String eventId) {
        Admin admin = requireAdmin(adminId);
        Event event = requireOwnedEvent(eventId, admin);
        return toResponse(event);
    }

    @Transactional
    public AdminEventResponse createEvent(UUID adminId, AdminEventRequest request) {
        Admin admin = requireAdmin(adminId);
        String eventId = normalizeId(request.getId());

        if (eventRepository.existsById(eventId)) {
            throw new BusinessException(ErrorCode.EVENT_ID_ALREADY_EXISTS);
        }

        validateStepDefinitions(request.getSteps());
        validateTagUidsUniqueAcrossSystem(request.getSteps(), null);

        Event event = eventRepository.save(Event.builder()
                .id(eventId)
                .title(request.getTitle().trim())
                .city(request.getCity().trim())
                .country(request.getCountry().trim())
                .status(request.getStatus())
                .featured(request.isFeatured())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(trimToNull(request.getDescription()))
                .heroImageUrl(trimToNull(request.getHeroImageUrl()))
                .partnerName(admin.getPartnerName())
                .themeColor(trimToNull(request.getThemeColor()))
                .build());

        for (AdminStepRequest stepRequest : request.getSteps()) {
            persistNewStep(event, stepRequest);
        }

        AdminRewardRequest rewardRequest = Objects.requireNonNull(request.getReward(), "Reward request must not be null");
        rewardTemplateRepository.save(RewardTemplate.builder()
                .event(event)
                .title(rewardRequest.getTitle().trim())
                .description(trimToNull(rewardRequest.getDescription()))
                .partnerName(admin.getPartnerName())
                .howToUse(trimToNull(rewardRequest.getHowToUse()))
                .validityDays(rewardRequest.getValidityDays())
                .emoji(trimToNull(rewardRequest.getEmoji()))
                .accentColor(trimToNull(rewardRequest.getAccentColor()))
                .build());

        return toResponse(event);
    }

    @Transactional
    public AdminEventResponse updateEvent(UUID adminId, String eventId, AdminEventRequest request) {
        Admin admin = requireAdmin(adminId);
        Event event = requireOwnedEvent(eventId, admin);

        if (!Objects.equals(event.getId(), normalizeId(request.getId()))) {
            throw new BusinessException(ErrorCode.EVENT_ID_ALREADY_EXISTS);
        }

        validateStepDefinitions(request.getSteps());
        validateTagUidsUniqueAcrossSystem(request.getSteps(), event.getId());

        boolean hasParticipations = participationRepository.existsByEventId(event.getId());

        event.updateFromAdmin(
                request.getTitle().trim(),
                request.getCity().trim(),
                request.getCountry().trim(),
                request.getStatus(),
                request.isFeatured(),
                request.getStartDate(),
                request.getEndDate(),
                trimToNull(request.getDescription()),
                trimToNull(request.getHeroImageUrl()),
                admin.getPartnerName(),
                trimToNull(request.getThemeColor())
        );

        upsertSteps(event, request.getSteps(), hasParticipations);
        upsertReward(event, admin, request.getReward());

        return toResponse(event);
    }

    @Transactional
    public void deleteEvent(UUID adminId, String eventId) {
        Admin admin = requireAdmin(adminId);
        Event event = requireOwnedEvent(eventId, admin);

        if (participationRepository.existsByEventId(event.getId())) {
            throw new BusinessException(ErrorCode.ADMIN_FORBIDDEN);
        }

        List<Step> steps = stepRepository.findByEventIdOrderByOrderIndex(event.getId());
        for (Step step : steps) {
            nftTemplateRepository.deleteByStepId(step.getId());
            nfcTagRepository.deleteByStepId(step.getId());
        }
        stepRepository.deleteAll(steps);
        rewardTemplateRepository.findByEventId(event.getId()).ifPresent(rewardTemplateRepository::delete);
        eventRepository.delete(event);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Admin requireAdmin(UUID adminId) {
        return adminRepository.findById(Objects.requireNonNull(adminId, "Admin id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_NOT_FOUND));
    }

    private Event requireOwnedEvent(String eventId, Admin admin) {
        Event event = eventRepository.findById(Objects.requireNonNull(eventId, "Event id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        if (!Objects.equals(event.getPartnerName(), admin.getPartnerName())) {
            throw new BusinessException(ErrorCode.ADMIN_FORBIDDEN);
        }
        return event;
    }

    private void validateStepDefinitions(List<AdminStepRequest> steps) {
        if (steps == null || steps.isEmpty()) {
            throw new BusinessException(ErrorCode.STEP_NOT_FOUND);
        }
        Set<Integer> orders = new HashSet<>();
        Set<String> tagUids = new HashSet<>();
        int finalCount = 0;
        for (AdminStepRequest step : steps) {
            if (!orders.add(step.getOrderIndex())) {
                throw new BusinessException(ErrorCode.DUPLICATE_STEP_ORDER);
            }
            String normalizedTag = normalizeTagUid(step.getTagUid());
            if (!tagUids.add(normalizedTag)) {
                throw new BusinessException(ErrorCode.DUPLICATE_TAG_UID);
            }
            if (trimToNull(step.getImageUrl()) == null) {
                throw new BusinessException(ErrorCode.STEP_PLACE_IMAGE_REQUIRED);
            }
            if (trimToNull(step.getNftImageUrl()) == null) {
                throw new BusinessException(ErrorCode.STEP_NFT_IMAGE_REQUIRED);
            }
            if (step.isFinalStep()) {
                finalCount++;
            }
        }
        if (finalCount != 1) {
            throw new BusinessException(ErrorCode.STEP_NOT_FOUND);
        }
    }

    private void validateTagUidsUniqueAcrossSystem(List<AdminStepRequest> steps, String ownEventId) {
        for (AdminStepRequest step : steps) {
            String normalized = normalizeTagUid(step.getTagUid());
            Optional<NfcTag> existing = nfcTagRepository.findByTagUid(normalized);
            if (existing.isPresent()) {
                Step ownerStep = existing.get().getStep();
                if (ownEventId == null || !Objects.equals(ownerStep.getEvent().getId(), ownEventId)) {
                    throw new BusinessException(ErrorCode.DUPLICATE_TAG_UID);
                }
            }
        }
    }

    private void upsertSteps(Event event, List<AdminStepRequest> requested, boolean hasParticipations) {
        List<Step> existing = stepRepository.findByEventIdOrderByOrderIndex(event.getId());
        Map<Integer, Step> byOrder = existing.stream().collect(Collectors.toMap(Step::getOrderIndex, s -> s));
        Set<Integer> seenOrders = new HashSet<>();

        for (AdminStepRequest req : requested) {
            seenOrders.add(req.getOrderIndex());
            Step step = byOrder.get(req.getOrderIndex());
            if (step == null) {
                persistNewStep(event, req);
            } else {
                updateExistingStep(step, req, hasParticipations);
            }
        }

        for (Map.Entry<Integer, Step> entry : byOrder.entrySet()) {
            if (!seenOrders.contains(entry.getKey())) {
                Step orphan = entry.getValue();
                if (stepCompletionRepository.existsByStepId(orphan.getId())) {
                    throw new BusinessException(ErrorCode.ADMIN_FORBIDDEN);
                }
                nftTemplateRepository.deleteByStepId(orphan.getId());
                nfcTagRepository.deleteByStepId(orphan.getId());
                stepRepository.delete(orphan);
            }
        }
    }

    private void persistNewStep(Event event, AdminStepRequest req) {
        Step step = stepRepository.save(Step.builder()
                .event(event)
                .orderIndex(req.getOrderIndex())
                .placeName(req.getPlaceName().trim())
                .placeDescription(trimToNull(req.getPlaceDescription()))
                .imageUrl(trimToNull(req.getImageUrl()))
                .lat(req.getLat())
                .lng(req.getLng())
                .finalStep(req.isFinalStep())
                .build());

        nfcTagRepository.save(NfcTag.builder()
                .step(step)
                .tagUid(normalizeTagUid(req.getTagUid()))
                .active(true)
                .build());

        nftTemplateRepository.save(NftTemplate.builder()
                .step(step)
                .name(req.getNftName().trim())
                .imageUrl(requireNftImage(req))
                .rarity(req.getNftRarity())
                .description(trimToNull(req.getNftDescription()))
                .build());
    }

    private void updateExistingStep(Step step, AdminStepRequest req, boolean hasParticipations) {
        step.updateFromAdmin(
                req.getPlaceName().trim(),
                trimToNull(req.getPlaceDescription()),
                trimToNull(req.getImageUrl()),
                req.getLat(),
                req.getLng(),
                req.isFinalStep()
        );

        String normalizedTag = normalizeTagUid(req.getTagUid());
        NfcTag tag = nfcTagRepository.findByStepId(step.getId()).orElse(null);
        if (tag == null) {
            nfcTagRepository.save(NfcTag.builder()
                    .step(step)
                    .tagUid(normalizedTag)
                    .active(true)
                    .build());
        } else {
            tag.updateTagUid(normalizedTag);
        }

        NftTemplate template = nftTemplateRepository.findByStepId(step.getId()).orElse(null);
        String nftImage = requireNftImage(req);
        if (template == null) {
            nftTemplateRepository.save(NftTemplate.builder()
                    .step(step)
                    .name(req.getNftName().trim())
                    .imageUrl(nftImage)
                    .rarity(req.getNftRarity())
                    .description(trimToNull(req.getNftDescription()))
                    .build());
        } else {
            template.updateFromAdmin(
                    req.getNftName().trim(),
                    nftImage,
                    req.getNftRarity(),
                    trimToNull(req.getNftDescription())
            );
        }
    }

    private void upsertReward(Event event, Admin admin, AdminRewardRequest request) {
        RewardTemplate template = rewardTemplateRepository.findByEventId(event.getId()).orElse(null);
        if (template == null) {
            rewardTemplateRepository.save(RewardTemplate.builder()
                    .event(event)
                    .title(request.getTitle().trim())
                    .description(trimToNull(request.getDescription()))
                    .partnerName(admin.getPartnerName())
                    .howToUse(trimToNull(request.getHowToUse()))
                    .validityDays(request.getValidityDays())
                    .emoji(trimToNull(request.getEmoji()))
                    .accentColor(trimToNull(request.getAccentColor()))
                    .build());
            return;
        }
        template.updateFromAdmin(
                request.getTitle().trim(),
                trimToNull(request.getDescription()),
                admin.getPartnerName(),
                trimToNull(request.getHowToUse()),
                request.getValidityDays(),
                trimToNull(request.getEmoji()),
                trimToNull(request.getAccentColor())
        );
    }

    private AdminEventResponse toResponse(Event event) {
        List<Step> steps = stepRepository.findByEventIdOrderByOrderIndex(event.getId());
        List<AdminStepResponse> stepResponses = new ArrayList<>();
        for (Step step : steps) {
            NfcTag tag = nfcTagRepository.findByStepId(step.getId()).orElse(null);
            NftTemplate template = nftTemplateRepository.findByStepId(step.getId()).orElse(null);
            stepResponses.add(AdminStepResponse.of(step, tag, template));
        }
        AdminRewardResponse rewardResponse = rewardTemplateRepository.findByEventId(event.getId())
                .map(AdminRewardResponse::from)
                .orElse(null);
        return AdminEventResponse.of(event, stepResponses, rewardResponse);
    }

    private static String normalizeId(String id) {
        return Objects.requireNonNull(id, "Event id must not be null").trim().toLowerCase();
    }

    private static String normalizeTagUid(String raw) {
        return Objects.requireNonNull(raw, "Tag uid must not be null").trim().toUpperCase();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String requireNftImage(AdminStepRequest request) {
        String imageUrl = trimToNull(request.getNftImageUrl());
        if (imageUrl == null) {
            throw new BusinessException(ErrorCode.STEP_NFT_IMAGE_REQUIRED);
        }
        return imageUrl;
    }
}
