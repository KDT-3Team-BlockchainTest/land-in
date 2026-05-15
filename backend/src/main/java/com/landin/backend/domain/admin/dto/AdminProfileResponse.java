package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.admin.entity.Admin;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AdminProfileResponse {

    private UUID id;
    private String email;
    private String partnerName;
    private String displayName;

    public static AdminProfileResponse from(Admin admin) {
        return AdminProfileResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .partnerName(admin.getPartnerName())
                .displayName(admin.getDisplayName())
                .build();
    }
}
