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
}
