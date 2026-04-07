package com.landin.backend.domain.reward.entity;

import com.landin.backend.domain.event.entity.Event;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "reward_templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RewardTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, unique = true)
    private Event event;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String partnerName;

    @Column(columnDefinition = "TEXT")
    private String howToUse;

    @Column(nullable = false)
    private int validityDays;

    private String emoji;
    private String accentColor;
}
