package com.landin.backend.domain.user.entity;

import com.landin.backend.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String displayName;

    private String avatarUrl;

    private String walletAddress;
    private Long walletChainId;
    private String walletProvider;
    private LocalDateTime walletConnectedAt;

    @Column(nullable = false)
    @Builder.Default
    private long nftCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private long landmarkCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private long cityCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private long countryCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private long completedCollectionCount = 0L;

    public void updateWalletConnection(String walletAddress, Long walletChainId, String walletProvider) {
        this.walletAddress = walletAddress;
        this.walletChainId = walletChainId;
        this.walletProvider = walletProvider;
        this.walletConnectedAt = LocalDateTime.now();
    }

    public void clearWalletConnection() {
        this.walletAddress = null;
        this.walletChainId = null;
        this.walletProvider = null;
        this.walletConnectedAt = null;
    }

    public void updateProfile(String displayName, String avatarUrl) {
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
    }

    public void updateStats(
            long nftCount,
            long landmarkCount,
            long cityCount,
            long countryCount,
            long completedCollectionCount
    ) {
        this.nftCount = nftCount;
        this.landmarkCount = landmarkCount;
        this.cityCount = cityCount;
        this.countryCount = countryCount;
        this.completedCollectionCount = completedCollectionCount;
    }

    public void increaseLandmarkCount() {
        this.landmarkCount++;
    }

    public void increaseNftCount() {
        this.nftCount++;
    }

    public void increaseCompletedCollectionCount() {
        this.completedCollectionCount++;
    }
}
