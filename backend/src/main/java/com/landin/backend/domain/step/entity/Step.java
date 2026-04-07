package com.landin.backend.domain.step.entity;

import com.landin.backend.domain.event.entity.Event;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "steps",
        indexes = @Index(name = "idx_step_event_order", columnList = "event_id, order_index"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Step {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private String placeName;

    @Column(columnDefinition = "TEXT")
    private String placeDescription;

    private String imageUrl;
    private String imageFallbackUrl;

    @Column(precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(precision = 10, scale = 7)
    private BigDecimal lng;

    @Column(nullable = false)
    private boolean finalStep;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
