package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.admin.entity.Admin;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AdminAuthResponse {

    private UUID id;
    private String email;
    private String partnerName;
    private String displayName;
    private String accessToken;

    public static AdminAuthResponse of(Admin admin, String accessToken) {
        return AdminAuthResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .partnerName(admin.getPartnerName())
                .displayName(admin.getDisplayName())
                .accessToken(accessToken)
                .build();
    }
}
