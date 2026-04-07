package com.landin.backend.domain.collection.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.collection.dto.CollectionResponse;
import com.landin.backend.domain.collection.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    /**
     * GET /api/collections?status=ongoing|completed|ended
     */
    @GetMapping
    public ApiResponse<List<CollectionResponse>> getCollections(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(collectionService.getCollections(userId, status));
    }
}
