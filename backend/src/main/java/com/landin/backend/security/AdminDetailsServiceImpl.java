package com.landin.backend.security;

import com.landin.backend.domain.admin.entity.Admin;
import com.landin.backend.domain.admin.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminDetailsServiceImpl {

    private final AdminRepository adminRepository;

    public UserDetails loadAdminById(String adminId) {
        UUID parsedAdminId = Objects.requireNonNull(UUID.fromString(adminId), "Parsed admin id must not be null");
        Admin admin = adminRepository.findById(parsedAdminId)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + adminId));

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        return new org.springframework.security.core.userdetails.User(
                admin.getId().toString(),
                admin.getPassword(),
                authorities
        );
    }
}
