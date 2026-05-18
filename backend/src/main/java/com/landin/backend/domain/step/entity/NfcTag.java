package com.landin.backend.domain.step.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nfc_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NfcTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false, unique = true)
    private Step step;

    @Column(unique = true, nullable = false)
    private String tagUid;

    @Column(nullable = false)
    private boolean active;

    /**
     * SUN/SDM 재전송 공격 방지용 NFC 카운터.
     * -1 = 아직 SUN/SDM으로 스캔된 적 없음 (초기값).
     * 이후 스캔마다 반드시 이전 값보다 커야 한다.
     */
    @Builder.Default
    @Column(name = "last_nfc_counter", nullable = false, columnDefinition = "INT DEFAULT -1")
    private int lastNfcCounter = -1;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void updateTagUid(String tagUid) {
        this.tagUid = tagUid;
    }

    public void updateActive(boolean active) {
        this.active = active;
    }

    public void updateNfcCounter(int counter) {
        this.lastNfcCounter = counter;
    }
}
