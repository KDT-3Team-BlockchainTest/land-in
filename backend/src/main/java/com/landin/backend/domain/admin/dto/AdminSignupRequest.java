package com.landin.backend.domain.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminSignupRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8, max = 64)
    private String password;

    @NotBlank
    private String partnerName;

    private String displayName;
}
