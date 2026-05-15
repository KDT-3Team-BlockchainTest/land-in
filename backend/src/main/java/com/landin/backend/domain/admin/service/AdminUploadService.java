package com.landin.backend.domain.admin.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.admin.dto.AdminImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUploadService {

    private static final long MAX_IMAGE_BYTES = 10L * 1024L * 1024L;
    private static final Map<String, String> EXTENSIONS_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.public-base-url:http://localhost:8080}")
    private String publicBaseUrl;

    public AdminImageUploadResponse uploadImage(MultipartFile file) {
        validateImage(file);

        String contentType = Objects.requireNonNull(file.getContentType(), "Content type must not be null")
                .toLowerCase(Locale.ROOT);
        String extension = EXTENSIONS_BY_CONTENT_TYPE.get(contentType);
        String filename = UUID.randomUUID() + extension;
        Path imageDir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("images");
        Path target = imageDir.resolve(filename).normalize();

        if (!target.startsWith(imageDir)) {
            throw new BusinessException(ErrorCode.INVALID_UPLOAD);
        }

        try {
            Files.createDirectories(imageDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INVALID_UPLOAD);
        }

        String publicPath = "/uploads/images/" + filename;
        return AdminImageUploadResponse.builder()
                .url(buildPublicUrl(publicPath))
                .path(publicPath)
                .originalFilename(file.getOriginalFilename())
                .size(file.getSize())
                .contentType(contentType)
                .build();
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_IMAGE_BYTES) {
            throw new BusinessException(ErrorCode.INVALID_UPLOAD);
        }

        String contentType = file.getContentType();
        if (contentType == null || !EXTENSIONS_BY_CONTENT_TYPE.containsKey(contentType.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.INVALID_UPLOAD);
        }
    }

    private String buildPublicUrl(String publicPath) {
        String baseUrl = publicBaseUrl == null ? "" : publicBaseUrl.trim();
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + publicPath;
    }
}
