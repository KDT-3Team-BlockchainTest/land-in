package com.landin.backend.domain.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminRewardRequest {

    @NotBlank
    private String title;

    private String description;

    private String howToUse;

    @Min(1)
    private int validityDays;

    private String emoji;
    private String accentColor;
}
