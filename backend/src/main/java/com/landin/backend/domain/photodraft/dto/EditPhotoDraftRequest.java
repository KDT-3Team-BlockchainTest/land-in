package com.landin.backend.domain.photodraft.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EditPhotoDraftRequest {
    private String filterType;
    private String frameId;
    private String badgeId;
    private Boolean datestampEnabled;
}
