package com.landin.backend.domain.admin.entity;

import com.landin.backend.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "admins")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Admin extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String partnerName;

    private String displayName;

    public void updateProfile(String partnerName, String displayName) {
        this.partnerName = partnerName;
        this.displayName = displayName;
    }
}
