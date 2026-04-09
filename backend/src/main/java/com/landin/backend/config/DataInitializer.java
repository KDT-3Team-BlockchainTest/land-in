package com.landin.backend.config;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import com.landin.backend.domain.event.repository.EventRepository;
import com.landin.backend.domain.nft.entity.UserNft;
import com.landin.backend.domain.nft.repository.UserNftRepository;
import com.landin.backend.domain.participation.entity.EventParticipation;
import com.landin.backend.domain.participation.repository.EventParticipationRepository;
import com.landin.backend.domain.reward.entity.RewardStatus;
import com.landin.backend.domain.reward.entity.RewardTemplate;
import com.landin.backend.domain.reward.entity.UserReward;
import com.landin.backend.domain.reward.repository.RewardTemplateRepository;
import com.landin.backend.domain.reward.repository.UserRewardRepository;
import com.landin.backend.domain.step.entity.NfcTag;
import com.landin.backend.domain.step.entity.NftRarity;
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
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"local", "prod", "production"})
public class DataInitializer implements CommandLineRunner {

    private static final String DEMO_EMAIL = "demo@landin.local";
    private static final String DEMO_PASSWORD = "demo1234!";

    private final EventRepository eventRepository;
    private final StepRepository stepRepository;
    private final StepCompletionRepository stepCompletionRepository;
    private final NfcTagRepository nfcTagRepository;
    private final NftTemplateRepository nftTemplateRepository;
    private final RewardTemplateRepository rewardTemplateRepository;
    private final UserRepository userRepository;
    private final EventParticipationRepository eventParticipationRepository;
    private final UserNftRepository userNftRepository;
    private final UserRewardRepository userRewardRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        ensureCatalogSeeded();
        seedDemoUserIfMissing();
    }

    private void ensureCatalogSeeded() {
        List<EventSeed> seeds = catalogSeeds();
        seeds.forEach(this::ensureEventSeeded);
        log.info("[DataInitializer] Catalog synchronization complete. events={}, steps={}, tags={}",
                eventRepository.count(), stepRepository.count(), nfcTagRepository.count());
    }

    private void seedDemoUserIfMissing() {
        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            log.info("[DataInitializer] Demo user already exists. Skipping demo user seed.");
            return;
        }

        User demoUser = Objects.requireNonNull(
                userRepository.save(Objects.requireNonNull(
                        User.builder()
                                .email(DEMO_EMAIL)
                                .password(passwordEncoder.encode(DEMO_PASSWORD))
                                .displayName("LandIn Demo")
                                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400")
                                .build(),
                        "Demo user must not be null"
                )),
                "Saved demo user must not be null"
        );

        joinEvent(demoUser, "paris-spring-2026", LocalDateTime.of(2026, 4, 2, 10, 0));
        joinEvent(demoUser, "seoul-palace-2026", LocalDateTime.of(2026, 1, 5, 11, 0));
        joinEvent(demoUser, "jeju-coast-2025", LocalDateTime.of(2025, 9, 3, 14, 0));

        completeSteps(demoUser, "paris-spring-2026", 6, LocalDateTime.of(2026, 4, 2, 10, 30));
        completeSteps(demoUser, "seoul-palace-2026", 3, LocalDateTime.of(2026, 1, 5, 12, 0));
        completeSteps(demoUser, "jeju-coast-2025", 3, LocalDateTime.of(2025, 9, 3, 15, 0));

        issueReward(demoUser, "paris-spring-2026", "LANDIN-LVR10", RewardStatus.AVAILABLE,
                LocalDateTime.of(2026, 4, 3, 9, 0), LocalDate.of(2026, 6, 30), null);
        issueReward(demoUser, "seoul-palace-2026", "SEOUL-NIGHT-77", RewardStatus.AVAILABLE,
                LocalDateTime.of(2026, 3, 31, 20, 0), LocalDate.of(2026, 5, 31), null);
        issueReward(demoUser, "jeju-coast-2025", "JEJU-RESORT-3", RewardStatus.EXPIRED,
                LocalDateTime.of(2025, 11, 30, 18, 0), LocalDate.of(2025, 12, 31), null);
        issueReward(demoUser, "tokyo-night-2026", "TOKYO-CAFE-1", RewardStatus.USED,
                LocalDateTime.of(2026, 3, 10, 9, 0), LocalDate.of(2026, 5, 31),
                LocalDateTime.of(2026, 3, 15, 18, 30));

        log.info("[DataInitializer] Demo user ready: {} / {}", DEMO_EMAIL, DEMO_PASSWORD);
    }

    private void ensureEventSeeded(EventSeed seed) {
        Event event = eventRepository.findById(seed.id())
                .orElseGet(() -> Objects.requireNonNull(
                        eventRepository.save(Objects.requireNonNull(
                                Event.builder()
                                        .id(seed.id())
                                        .title(seed.title())
                                        .city(seed.city())
                                        .country(seed.country())
                                        .status(seed.status())
                                        .featured(seed.featured())
                                        .startDate(seed.startDate())
                                        .endDate(seed.endDate())
                                        .description(seed.description())
                                        .heroImageUrl(seed.heroImageUrl())
                                        .partnerName(seed.partnerName())
                                        .themeColor(seed.themeColor())
                                        .build(),
                                "Event must not be null"
                        )),
                        "Saved event must not be null"
                ));

        seed.steps().forEach(stepSeed -> ensureStepSeeded(event, stepSeed));

        if (rewardTemplateRepository.findByEventId(seed.id()).isEmpty()) {
            Objects.requireNonNull(
                    rewardTemplateRepository.save(Objects.requireNonNull(
                            RewardTemplate.builder()
                                    .event(event)
                                    .title(seed.reward().title())
                                    .description(seed.reward().description())
                                    .partnerName(seed.reward().partnerName())
                                    .howToUse(seed.reward().howToUse())
                                    .validityDays(seed.reward().validityDays())
                                    .emoji(seed.reward().emoji())
                                    .accentColor(seed.reward().accentColor())
                                    .build(),
                            "Reward template must not be null"
                    )),
                    "Saved reward template must not be null"
            );
        }
    }

    private void ensureStepSeeded(Event event, StepSeed seed) {
        Step step = stepRepository.findByEventIdAndOrderIndex(event.getId(), seed.orderIndex())
                .orElseGet(() -> Objects.requireNonNull(
                        stepRepository.save(Objects.requireNonNull(
                                Step.builder()
                                        .event(event)
                                        .orderIndex(seed.orderIndex())
                                        .placeName(seed.placeName())
                                        .placeDescription(seed.placeDescription())
                                        .imageUrl(seed.imageUrl())
                                        .finalStep(seed.finalStep())
                                        .build(),
                                "Step must not be null"
                        )),
                        "Saved step must not be null"
                ));

        if (nfcTagRepository.findByTagUid(seed.tagUid()).isEmpty()) {
            Objects.requireNonNull(
                    nfcTagRepository.save(Objects.requireNonNull(
                            NfcTag.builder()
                                    .step(step)
                                    .tagUid(seed.tagUid())
                                    .active(true)
                                    .build(),
                            "NFC tag must not be null"
                    )),
                    "Saved NFC tag must not be null"
            );
        }

        if (nftTemplateRepository.findByStepId(step.getId()).isEmpty()) {
            Objects.requireNonNull(
                    nftTemplateRepository.save(Objects.requireNonNull(
                            NftTemplate.builder()
                                    .step(step)
                                    .name(seed.nftName())
                                    .imageUrl(seed.imageUrl())
                                    .rarity(seed.rarity())
                                    .description(seed.nftDescription())
                                    .build(),
                            "NFT template must not be null"
                    )),
                    "Saved NFT template must not be null"
            );
        }
    }

    private void joinEvent(User user, String eventId, LocalDateTime joinedAt) {
        Event event = eventRepository.findById(Objects.requireNonNull(eventId, "Event id must not be null"))
                .orElseThrow(() -> new IllegalStateException("Missing event: " + eventId));

        Objects.requireNonNull(
                eventParticipationRepository.save(Objects.requireNonNull(
                        EventParticipation.builder()
                                .user(user)
                                .event(event)
                                .joinedAt(joinedAt)
                                .build(),
                        "Participation must not be null"
                )),
                "Saved participation must not be null"
        );
    }

    private void completeSteps(User user, String eventId, int count, LocalDateTime startedAt) {
        Event event = eventRepository.findById(Objects.requireNonNull(eventId, "Event id must not be null"))
                .orElseThrow(() -> new IllegalStateException("Missing event: " + eventId));
        List<Step> steps = stepRepository.findByEventIdOrderByOrderIndex(eventId);

        for (int i = 0; i < Math.min(count, steps.size()); i++) {
            Step step = steps.get(i);
            NftTemplate nftTemplate = nftTemplateRepository.findByStepId(step.getId())
                    .orElseThrow(() -> new IllegalStateException("Missing NFT template for step " + step.getId()));
            LocalDateTime completedAt = startedAt.plusDays(i);

            Objects.requireNonNull(
                    stepCompletionRepository.save(Objects.requireNonNull(
                            StepCompletion.builder()
                                    .user(user)
                                    .step(step)
                                    .completedAt(completedAt)
                                    .build(),
                            "Step completion must not be null"
                    )),
                    "Saved step completion must not be null"
            );

            Objects.requireNonNull(
                    userNftRepository.save(Objects.requireNonNull(
                            UserNft.builder()
                                    .user(user)
                                    .step(step)
                                    .event(event)
                                    .nftTemplate(nftTemplate)
                                    .name(nftTemplate.getName())
                                    .imageUrl(nftTemplate.getImageUrl())
                                    .rarity(nftTemplate.getRarity())
                                    .mintedAt(completedAt)
                                    .build(),
                            "User NFT must not be null"
                    )),
                    "Saved user NFT must not be null"
            );
        }
    }

    private void issueReward(User user, String eventId, String couponCode, RewardStatus status,
                             LocalDateTime issuedAt, LocalDate validUntil, LocalDateTime usedAt) {
        Event event = eventRepository.findById(Objects.requireNonNull(eventId, "Event id must not be null"))
                .orElseThrow(() -> new IllegalStateException("Missing event: " + eventId));
        RewardTemplate rewardTemplate = rewardTemplateRepository.findByEventId(Objects.requireNonNull(eventId, "Event id must not be null"))
                .orElseThrow(() -> new IllegalStateException("Missing reward template for event " + eventId));

        Objects.requireNonNull(
                userRewardRepository.save(Objects.requireNonNull(
                        UserReward.builder()
                                .user(user)
                                .event(event)
                                .rewardTemplate(rewardTemplate)
                                .couponCode(couponCode)
                                .status(status)
                                .issuedAt(issuedAt)
                                .validUntil(validUntil)
                                .usedAt(usedAt)
                                .build(),
                        "User reward must not be null"
                )),
                "Saved user reward must not be null"
        );
    }

    private List<EventSeed> catalogSeeds() {
        return List.of(
                new EventSeed(
                        "paris-spring-2026",
                        "2026 Paris Landmark Collection",
                        "Paris",
                        "France",
                        EventStatus.ACTIVE,
                        true,
                        LocalDate.of(2026, 4, 1),
                        LocalDate.of(2026, 6, 30),
                        "Collect NFC stamps across eight Paris landmarks and unlock a spring travel reward.",
                        "https://images.unsplash.com/photo-1683151155634-08978faf9cc7?w=1080",
                        "Louvre Museum",
                        "#C8A96E",
                        List.of(
                                new StepSeed(1, "Eiffel Tower", "Paris icon completed for the 1889 World's Fair.",
                                        "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400",
                                        "TAG-PARIS-001", "Eiffel Tower NFT", NftRarity.COMMON,
                                        "A skyline-themed NFT inspired by the Eiffel Tower.", false),
                                new StepSeed(2, "Louvre Museum", "The world's most visited museum and home of the Mona Lisa.",
                                        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400",
                                        "TAG-PARIS-002", "Louvre Pyramid NFT", NftRarity.RARE,
                                        "A reflective NFT themed after the Louvre glass pyramid.", false),
                                new StepSeed(3, "Notre-Dame", "Gothic cathedral reborn after restoration.",
                                        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
                                        "TAG-PARIS-003", "Notre-Dame NFT", NftRarity.COMMON,
                                        "A stained-glass inspired collectible from Notre-Dame.", false),
                                new StepSeed(4, "Arc de Triomphe", "A monumental arch at the center of Place Charles de Gaulle.",
                                        "https://images.unsplash.com/photo-1478136791624-4e3a8e1af1e3?w=400",
                                        "TAG-PARIS-004", "Arc de Triomphe NFT", NftRarity.COMMON,
                                        "A triumph-inspired NFT with Paris avenue motifs.", false),
                                new StepSeed(5, "Musee d'Orsay", "A former railway station turned impressionist museum.",
                                        "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400",
                                        "TAG-PARIS-005", "Orsay Gallery NFT", NftRarity.RARE,
                                        "An impressionist palette collectible for museum visitors.", false),
                                new StepSeed(6, "Montmartre", "An artistic hilltop district with classic Paris atmosphere.",
                                        "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400",
                                        "TAG-PARIS-006", "Montmartre NFT", NftRarity.COMMON,
                                        "A bohemian street-scene NFT from Montmartre.", false),
                                new StepSeed(7, "Palace of Versailles", "A short trip from Paris to the grand royal palace.",
                                        "https://images.unsplash.com/photo-1499856871958-5b9367545d1a?w=400",
                                        "TAG-PARIS-007", "Versailles NFT", NftRarity.RARE,
                                        "A gold-accented collectible inspired by Versailles.", false),
                                new StepSeed(8, "Centre Pompidou", "Modern art and architecture wrapped into one final stop.",
                                        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400",
                                        "TAG-PARIS-008", "Paris Traveler Badge NFT", NftRarity.LEGENDARY,
                                        "The final Paris badge awarded after completing the route.", true)
                        ),
                        new RewardSeed(
                                "Paris traveler badge NFT + 10% off Louvre tickets",
                                "Finish the Paris route to unlock a signature badge NFT and a Louvre partner discount.",
                                "Louvre Museum",
                                "Show the coupon code at the ticket desk to receive the partner benefit.",
                                90,
                                "ticket",
                                "#C8A96E"
                        )
                ),
                new EventSeed(
                        "tokyo-night-2026",
                        "Tokyo Night Collection",
                        "Tokyo",
                        "Japan",
                        EventStatus.ACTIVE,
                        false,
                        LocalDate.of(2026, 3, 1),
                        LocalDate.of(2026, 5, 31),
                        "Explore six Tokyo night spots and collect neon-themed NFTs along the route.",
                        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1080",
                        "Shibuya Art Cafe",
                        "#FF6B9D",
                        List.of(
                                new StepSeed(1, "Shibuya Scramble", "The iconic crossing where Tokyo's energy never sleeps.",
                                        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400",
                                        "TAG-TOKYO-001", "Shibuya Scramble NFT", NftRarity.COMMON,
                                        "A neon city collectible inspired by the world's busiest crossing.", false),
                                new StepSeed(2, "Asakusa Senso-ji", "A classic temple district glowing after sunset.",
                                        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
                                        "TAG-TOKYO-002", "Senso-ji NFT", NftRarity.COMMON,
                                        "A lantern-lit NFT rooted in Tokyo tradition.", false),
                                new StepSeed(3, "Yoyogi Park", "A quiet pause between city lights and weekend performances.",
                                        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400",
                                        "TAG-TOKYO-003", "Yoyogi Park NFT", NftRarity.COMMON,
                                        "A calm green-toned NFT for the city's open-air side.", false),
                                new StepSeed(4, "Tokyo Skytree", "A 634m observation icon with panoramic city views.",
                                        "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400",
                                        "TAG-TOKYO-004", "Tokyo Skytree NFT", NftRarity.RARE,
                                        "A skyline NFT minted from Tokyo's tallest tower.", false),
                                new StepSeed(5, "Harajuku Street", "Bold fashion, snacks, and subculture in every alley.",
                                        "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400",
                                        "TAG-TOKYO-005", "Harajuku NFT", NftRarity.COMMON,
                                        "A colorful street-style NFT from Harajuku.", false),
                                new StepSeed(6, "Akihabara", "Tokyo's electric town and the final checkpoint of the route.",
                                        "https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=400",
                                        "TAG-TOKYO-006", "Tokyo Night Badge NFT", NftRarity.LEGENDARY,
                                        "The final badge for collectors who finish Tokyo Night.", true)
                        ),
                        new RewardSeed(
                                "Tokyo night badge NFT + free drink at Shibuya Art Cafe",
                                "Collectors who complete the Tokyo route receive a badge NFT and a cafe reward.",
                                "Shibuya Art Cafe",
                                "Present the coupon code at the cafe counter for one complimentary drink.",
                                60,
                                "coffee",
                                "#FF6B9D"
                        )
                ),
                new EventSeed(
                        "seoul-palace-2026",
                        "Seoul Palace Heritage Collection",
                        "Seoul",
                        "South Korea",
                        EventStatus.COMPLETED,
                        false,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 3, 31),
                        "A completed heritage route across three palace landmarks in Seoul.",
                        "https://images.unsplash.com/photo-1625551922738-3fb390d041dc?w=1080",
                        "Korea Heritage Service",
                        "#8B5CF6",
                        List.of(
                                new StepSeed(1, "Gyeongbokgung", "The main royal palace and a symbol of Joseon history.",
                                        "https://images.unsplash.com/photo-1625551922738-3fb390d041dc?w=400",
                                        "TAG-SEOUL-001", "Gyeongbokgung NFT", NftRarity.COMMON,
                                        "A palace courtyard collectible from Seoul's best-known royal site.", false),
                                new StepSeed(2, "Changdeokgung", "A UNESCO-listed palace with a serene secret garden.",
                                        "https://images.unsplash.com/photo-1598765900908-9f5e29e65f83?w=400",
                                        "TAG-SEOUL-002", "Changdeokgung NFT", NftRarity.RARE,
                                        "A refined heritage NFT inspired by palace architecture.", false),
                                new StepSeed(3, "Deoksugung", "A downtown palace route where old stone walls meet the city.",
                                        "https://images.unsplash.com/photo-1583245177184-4ab53a4a3b9c?w=400",
                                        "TAG-SEOUL-003", "Seoul Heritage Badge NFT", NftRarity.LEGENDARY,
                                        "The final Seoul heritage badge for route completion.", true)
                        ),
                        new RewardSeed(
                                "Palace evening admission pass + Seoul heritage badge NFT",
                                "A reward package for collectors who complete the Seoul heritage route.",
                                "Korea Heritage Service",
                                "Use the code at the palace evening admission booth before the expiry date.",
                                180,
                                "palace",
                                "#8B5CF6"
                        )
                ),
                new EventSeed(
                        "jeju-coast-2025",
                        "Jeju Coast Collection",
                        "Jeju",
                        "South Korea",
                        EventStatus.ENDED,
                        false,
                        LocalDate.of(2025, 9, 1),
                        LocalDate.of(2025, 11, 30),
                        "An ended collection that captured three dramatic coastal scenes around Jeju.",
                        "https://images.unsplash.com/photo-1580200978052-3a1a86d7e290?w=1080",
                        "Jeju Resort",
                        "#06B6D4",
                        List.of(
                                new StepSeed(1, "Yongmeori Coast", "A rugged shoreline shaped by volcanic rock layers.",
                                        "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=400",
                                        "TAG-JEJU-001", "Yongmeori NFT", NftRarity.COMMON,
                                        "A coastal collectible featuring Jeju's layered cliffs.", false),
                                new StepSeed(2, "Seongsan Ilchulbong", "A sunrise tuff cone and one of Jeju's best-known landmarks.",
                                        "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400",
                                        "TAG-JEJU-002", "Seongsan NFT", NftRarity.RARE,
                                        "A dawn-inspired NFT celebrating Jeju's volcanic scenery.", false),
                                new StepSeed(3, "Woljeongri Beach", "A breezy coastal stop with emerald water and a relaxed boardwalk.",
                                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
                                        "TAG-JEJU-003", "Jeju Coast Finale NFT", NftRarity.LEGENDARY,
                                        "The finale NFT for completing the Jeju coast route.", true)
                        ),
                        new RewardSeed(
                                "Jeju coast finale NFT + partner resort benefit",
                                "Even after the season ends, the Jeju finale reward stays visible in your collection.",
                                "Jeju Resort",
                                "Enter the code during reservation or show it at check-in if still valid.",
                                365,
                                "ocean",
                                "#06B6D4"
                        )
                ),
                new EventSeed(
                        "bangkok-2026",
                        "Bangkok Temple Collection",
                        "Bangkok",
                        "Thailand",
                        EventStatus.UPCOMING,
                        false,
                        LocalDate.of(2026, 5, 15),
                        LocalDate.of(2026, 8, 15),
                        "An upcoming route through seven temple and riverside landmarks in Bangkok.",
                        "https://images.unsplash.com/photo-1716824685050-01c7554c63f4?w=1080",
                        "Bangkok Heritage Pass",
                        "#F59E0B",
                        List.of(
                                new StepSeed(1, "Wat Phra Kaew", "The Temple of the Emerald Buddha inside the Grand Palace complex.",
                                        "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400",
                                        "TAG-BANGKOK-001", "Wat Phra Kaew NFT", NftRarity.RARE,
                                        "A luminous temple NFT inspired by Bangkok's royal complex.", false),
                                new StepSeed(2, "Wat Arun", "The riverside temple famous for its porcelain-decorated tower.",
                                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                                        "TAG-BANGKOK-002", "Wat Arun NFT", NftRarity.COMMON,
                                        "A sunrise-themed NFT drawn from Wat Arun's silhouette.", false),
                                new StepSeed(3, "Wat Pho", "Home of the giant reclining Buddha and traditional Thai healing arts.",
                                        "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400",
                                        "TAG-BANGKOK-003", "Wat Pho NFT", NftRarity.COMMON,
                                        "A golden reclining-Buddha collectible.", false),
                                new StepSeed(4, "Lumphini Park", "A green city break before the route heads back to the river.",
                                        "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=400",
                                        "TAG-BANGKOK-004", "Lumphini Park NFT", NftRarity.COMMON,
                                        "A relaxed city-park NFT for Bangkok explorers.", false),
                                new StepSeed(5, "Grand Palace", "An ornate historic complex with layered Thai architecture.",
                                        "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400",
                                        "TAG-BANGKOK-005", "Grand Palace NFT", NftRarity.RARE,
                                        "A regal collectible tied to Bangkok's ceremonial heart.", false),
                                new StepSeed(6, "Pak Khlong Talat", "A vivid flower market that keeps the city bright all night.",
                                        "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400",
                                        "TAG-BANGKOK-006", "Flower Market NFT", NftRarity.COMMON,
                                        "A floral night-market NFT filled with Bangkok color.", false),
                                new StepSeed(7, "Chao Phraya Riverside", "The final waterfront stop that closes the temple route.",
                                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
                                        "TAG-BANGKOK-007", "Bangkok Heritage Badge NFT", NftRarity.LEGENDARY,
                                        "The final Bangkok badge for full route completion.", true)
                        ),
                        new RewardSeed(
                                "Bangkok heritage pass discount + signature badge NFT",
                                "A future reward prepared for Bangkok collectors who finish the whole route.",
                                "Bangkok Heritage Pass",
                                "The partner benefit can be redeemed at participating ticket counters.",
                                90,
                                "temple",
                                "#F59E0B"
                        )
                ),
                new EventSeed(
                        "barcelona-2026",
                        "Barcelona Architecture Collection",
                        "Barcelona",
                        "Spain",
                        EventStatus.UPCOMING,
                        false,
                        LocalDate.of(2026, 6, 1),
                        LocalDate.of(2026, 9, 30),
                        "An upcoming architecture route across six Barcelona landmarks.",
                        "https://images.unsplash.com/photo-1664027802288-293c4ebdcf95?w=1080",
                        "Gaudi Pass",
                        "#EC4899",
                        List.of(
                                new StepSeed(1, "Sagrada Familia", "Gaudi's unfinished basilica and Barcelona's most iconic skyline.",
                                        "https://images.unsplash.com/photo-1617379059906-48d2ea43c0ad?w=400",
                                        "TAG-BCN-001", "Sagrada Familia NFT", NftRarity.LEGENDARY,
                                        "A stained-glass style NFT inspired by Barcelona's basilica.", false),
                                new StepSeed(2, "Park Guell", "Curved mosaics, terraces, and playful shapes across the hillside.",
                                        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400",
                                        "TAG-BCN-002", "Park Guell NFT", NftRarity.RARE,
                                        "A colorful mosaic collectible from Park Guell.", false),
                                new StepSeed(3, "Casa Batllo", "A wavy facade that feels like architecture in motion.",
                                        "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=400",
                                        "TAG-BCN-003", "Casa Batllo NFT", NftRarity.RARE,
                                        "A fluid facade NFT inspired by Casa Batllo.", false),
                                new StepSeed(4, "La Pedrera", "Stone curves and rooftop chimneys with unmistakable Gaudi character.",
                                        "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=400",
                                        "TAG-BCN-004", "La Pedrera NFT", NftRarity.COMMON,
                                        "A sculptural rooftop collectible from La Pedrera.", false),
                                new StepSeed(5, "Gothic Quarter", "Historic lanes where medieval Barcelona still feels alive.",
                                        "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=400",
                                        "TAG-BCN-005", "Gothic Quarter NFT", NftRarity.COMMON,
                                        "A stone-alley collectible for old city explorers.", false),
                                new StepSeed(6, "Picasso Museum", "The final stop highlighting the city's artistic side.",
                                        "https://images.unsplash.com/photo-1601178865344-b4bfe1e6d2ae?w=400",
                                        "TAG-BCN-006", "Barcelona Art Badge NFT", NftRarity.LEGENDARY,
                                        "The final Barcelona badge for architecture route completion.", true)
                        ),
                        new RewardSeed(
                                "Gaudi pass discount + Barcelona art badge NFT",
                                "A partner benefit prepared for the Barcelona architecture season.",
                                "Gaudi Pass",
                                "Redeem the code during partner ticket booking for the discount benefit.",
                                90,
                                "art",
                                "#EC4899"
                        )
                ),
                new EventSeed(
                        "dubai-2026",
                        "Dubai Skyline Collection",
                        "Dubai",
                        "United Arab Emirates",
                        EventStatus.UPCOMING,
                        false,
                        LocalDate.of(2026, 7, 1),
                        LocalDate.of(2026, 10, 31),
                        "A modern skyline route across six Dubai landmarks.",
                        "https://images.unsplash.com/photo-1667753979736-5893291ac7f6?w=1080",
                        "Burj Khalifa Sky",
                        "#D4AF37",
                        List.of(
                                new StepSeed(1, "Burj Khalifa", "The tallest tower in the world and the anchor of Dubai's skyline.",
                                        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400",
                                        "TAG-DUBAI-001", "Burj Khalifa NFT", NftRarity.LEGENDARY,
                                        "A gold-accented skyline NFT inspired by Burj Khalifa.", false),
                                new StepSeed(2, "Dubai Marina", "Waterfront towers and yacht-lined promenades after dark.",
                                        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400",
                                        "TAG-DUBAI-002", "Dubai Marina NFT", NftRarity.RARE,
                                        "A reflective waterfront collectible from Dubai Marina.", false),
                                new StepSeed(3, "Gold Souk", "A traditional market where the city's luxury identity shines.",
                                        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400",
                                        "TAG-DUBAI-003", "Gold Souk NFT", NftRarity.RARE,
                                        "A warm metallic NFT themed around the Gold Souk.", false),
                                new StepSeed(4, "Museum of the Future", "A bold piece of future-facing architecture and innovation.",
                                        "https://images.unsplash.com/photo-1644424235476-295f24d5031b?w=400",
                                        "TAG-DUBAI-004", "Future Museum NFT", NftRarity.COMMON,
                                        "A futuristic collectible minted from Dubai's innovation landmark.", false),
                                new StepSeed(5, "Palm Jumeirah", "A man-made island that defines Dubai's resort image.",
                                        "https://images.unsplash.com/photo-1546412414-8035e1776c9a?w=400",
                                        "TAG-DUBAI-005", "Palm Jumeirah NFT", NftRarity.COMMON,
                                        "A resort-themed NFT from Dubai's palm-shaped coast.", false),
                                new StepSeed(6, "Dubai Frame", "The final checkpoint framing old and new Dubai together.",
                                        "https://images.unsplash.com/photo-1596547609652-9cf5d4d2c37e?w=400",
                                        "TAG-DUBAI-006", "Dubai Gold Badge NFT", NftRarity.LEGENDARY,
                                        "The final badge for completing the Dubai skyline route.", true)
                        ),
                        new RewardSeed(
                                "Burj Khalifa sky access benefit + Dubai gold badge NFT",
                                "A premium reward package prepared for Dubai skyline collectors.",
                                "Burj Khalifa Sky",
                                "Show the partner code at the attraction entrance to receive the benefit.",
                                90,
                                "gold",
                                "#D4AF37"
                        )
                )
        );
    }

    private record EventSeed(
            String id,
            String title,
            String city,
            String country,
            EventStatus status,
            boolean featured,
            LocalDate startDate,
            LocalDate endDate,
            String description,
            String heroImageUrl,
            String partnerName,
            String themeColor,
            List<StepSeed> steps,
            RewardSeed reward
    ) {
    }

    private record StepSeed(
            int orderIndex,
            String placeName,
            String placeDescription,
            String imageUrl,
            String tagUid,
            String nftName,
            NftRarity rarity,
            String nftDescription,
            boolean finalStep
    ) {
    }

    private record RewardSeed(
            String title,
            String description,
            String partnerName,
            String howToUse,
            int validityDays,
            String emoji,
            String accentColor
    ) {
    }
}
