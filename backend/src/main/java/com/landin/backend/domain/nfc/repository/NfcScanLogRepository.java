package com.landin.backend.domain.nfc.repository;

import com.landin.backend.domain.nfc.entity.NfcScanLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NfcScanLogRepository extends JpaRepository<NfcScanLog, UUID> {
}
