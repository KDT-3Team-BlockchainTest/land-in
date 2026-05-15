package com.landin.backend.domain.admin.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.admin.dto.AdminAuthResponse;
import com.landin.backend.domain.admin.dto.AdminLoginRequest;
import com.landin.backend.domain.admin.dto.AdminProfileResponse;
import com.landin.backend.domain.admin.dto.AdminSignupRequest;
import com.landin.backend.domain.admin.entity.Admin;
import com.landin.backend.domain.admin.repository.AdminRepository;
import com.landin.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AdminAuthResponse signup(AdminSignupRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (adminRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException(ErrorCode.ADMIN_EMAIL_ALREADY_EXISTS);
        }

        Admin admin = adminRepository.save(Admin.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .partnerName(normalizeRequired(request.getPartnerName()))
                .displayName(normalizeOptional(request.getDisplayName()))
                .build());

        String token = jwtTokenProvider.generateToken(
                Objects.requireNonNull(admin.getId(), "Saved admin id must not be null"),
                JwtTokenProvider.ROLE_ADMIN
        );
        return AdminAuthResponse.of(admin, token);
    }

    @Transactional(readOnly = true)
    public AdminAuthResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        String token = jwtTokenProvider.generateToken(admin.getId(), JwtTokenProvider.ROLE_ADMIN);
        return AdminAuthResponse.of(admin, token);
    }

    @Transactional(readOnly = true)
    public AdminProfileResponse getProfile(UUID adminId) {
        Admin admin = adminRepository.findById(Objects.requireNonNull(adminId, "Admin id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.ADMIN_NOT_FOUND));
        return AdminProfileResponse.from(admin);
    }

    private String normalizeEmail(String email) {
        return Objects.requireNonNull(email, "Email must not be null").trim().toLowerCase();
    }

    private String normalizeRequired(String value) {
        return Objects.requireNonNull(value, "Required value must not be null").trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
