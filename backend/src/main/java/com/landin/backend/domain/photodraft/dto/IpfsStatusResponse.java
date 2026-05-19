package com.landin.backend.domain.photodraft.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IpfsStatusResponse {
    private String status;         // UPLOADING_IMAGE | IMAGE_PINNED | UPLOADING_METADATA | COMPLETED | FAILED
    private String imageCid;
    private String metadataCid;
    private String tokenUri;       // ipfs://{metadataCID}
    private String errorMessage;
}
