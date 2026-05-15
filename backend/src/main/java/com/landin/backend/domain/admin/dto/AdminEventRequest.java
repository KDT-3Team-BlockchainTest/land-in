package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.event.entity.EventStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminEventRequest {

    @NotBlank
    @Pattern(regexp = "^[a-z0-9-]+$", message = "ID는 소문자, 숫자, 하이픈만 사용할 수 있습니다.")
    @Size(min = 3, max = 64)
    private String id;

    @NotBlank
    private String title;

    @NotBlank
    private String city;

    @NotBlank
    private String country;

    @NotNull
    private EventStatus status;

    private boolean featured;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String description;

    private String heroImageUrl;

    private String themeColor;

    @Valid
    @NotNull
    private List<AdminStepRequest> steps;

    @Valid
    @NotNull
    private AdminRewardRequest reward;
}
