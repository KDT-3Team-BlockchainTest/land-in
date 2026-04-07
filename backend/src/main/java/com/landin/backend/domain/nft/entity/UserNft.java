package com.landin.backend.domain.nft.entity;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.step.entity.NftRarity;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import com.landin.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_nfts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "step_id"}),
        indexes = @Index(name = "idx_user_nft_user_event", columnList = "user_id, event_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserNft {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private Step step;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nft_template_id", nullable = false)
    private NftTemplate nftTemplate;

    // 발행 시점 복사 (템플릿 변경 영향 차단)
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NftRarity rarity;

    @Column(nullable = false)
    private LocalDateTime mintedAt;
}
