package com.landin.backend.domain.step.entity;

import com.landin.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "step_completions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "step_id"}),
        indexes = @Index(name = "idx_sc_user_step", columnList = "user_id, step_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class StepCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private Step step;

    @Column(nullable = false)
    private LocalDateTime completedAt;
}
