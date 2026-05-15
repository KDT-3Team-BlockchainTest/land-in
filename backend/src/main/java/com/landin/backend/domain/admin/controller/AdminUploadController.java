package com.landin.backend.domain.admin.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.admin.dto.AdminImageUploadResponse;
import com.landin.backend.domain.admin.service.AdminUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/uploads")
@RequiredArgsConstructor
public class AdminUploadController {

    private final AdminUploadService adminUploadService;

    @PostMapping("/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(adminUploadService.uploadImage(file), "이미지를 업로드했습니다.");
    }
}
