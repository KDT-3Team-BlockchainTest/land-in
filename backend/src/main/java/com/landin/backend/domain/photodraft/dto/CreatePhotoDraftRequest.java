package com.landin.backend.domain.photodraft.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreatePhotoDraftRequest {

    @NotBlank
    private String visitId;

    private String stepId;
}
