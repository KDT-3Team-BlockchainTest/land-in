package com.landin.backend.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminImageUploadResponse {
    private String url;
    private String path;
    private String originalFilename;
    private long size;
    private String contentType;
}
