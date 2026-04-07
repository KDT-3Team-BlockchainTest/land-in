package com.landin.backend.domain.nfc.entity;

import com.landin.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nfc_scan_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NfcScanLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String tagUid;

    @Column(nullable = false)
    private LocalDateTime scannedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NfcScanResult result;
}
