package com.landin.backend.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class WalletConnectRequest {

    @NotBlank(message = "지갑 주소는 필수입니다.")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "올바른 지갑 주소 형식이 아닙니다.")
    private String walletAddress;

    @NotNull(message = "체인 ID는 필수입니다.")
    private Long chainId;

    private String walletProvider;
}
