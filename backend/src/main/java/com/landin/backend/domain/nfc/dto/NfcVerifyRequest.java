package com.landin.backend.domain.nfc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class NfcVerifyRequest {
    @NotBlank(message = "tagUid는 필수입니다.")
    private String tagUid;
}
