package com.landin.backend.domain.reward.entity;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_rewards",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "event_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserReward {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_template_id", nullable = false)
    private RewardTemplate rewardTemplate;

    @Column(unique = true, nullable = false)
    private String couponCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RewardStatus status;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDate validUntil;

    private LocalDateTime usedAt;

    public void use() {
        this.status = RewardStatus.USED;
        this.usedAt = LocalDateTime.now();
    }

    public void expire() {
        this.status = RewardStatus.EXPIRED;
    }
}
