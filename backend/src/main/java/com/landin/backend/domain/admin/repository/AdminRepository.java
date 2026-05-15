package com.landin.backend.domain.admin.repository;

import com.landin.backend.domain.admin.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    Optional<Admin> findByEmail(String email);
    boolean existsByEmail(String email);
}
