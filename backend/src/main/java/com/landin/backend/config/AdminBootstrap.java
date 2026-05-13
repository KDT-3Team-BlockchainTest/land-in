package com.landin.backend.config;

import com.landin.backend.domain.admin.entity.Admin;
import com.landin.backend.domain.admin.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds a single default admin account on startup when no admins exist.
 * All catalog data (events, steps, rewards) is created via the admin web UI.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap-email:admin@landin.local}")
    private String bootstrapEmail;

    @Value("${app.admin.bootstrap-password:admin1234!}")
    private String bootstrapPassword;

    @Value("${app.admin.bootstrap-partner-name:Land-In Partner}")
    private String bootstrapPartnerName;

    @Value("${app.admin.bootstrap-display-name:Land-In Admin}")
    private String bootstrapDisplayName;

    @Override
    @Transactional
    public void run(String... args) {
        if (adminRepository.count() > 0) {
            return;
        }
        Admin admin = adminRepository.save(Admin.builder()
                .email(bootstrapEmail.trim().toLowerCase())
                .password(passwordEncoder.encode(bootstrapPassword))
                .partnerName(bootstrapPartnerName)
                .displayName(bootstrapDisplayName)
                .build());
        log.info("[AdminBootstrap] Default admin created: email={}, partner={}", admin.getEmail(), admin.getPartnerName());
        log.info("[AdminBootstrap] Initial password (change after first login): {}", bootstrapPassword);
    }
}
