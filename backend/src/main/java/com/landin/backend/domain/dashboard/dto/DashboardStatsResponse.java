package com.landin.backend.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {
    private long nftCount;
    private long landmarkCount;       // 완료된 스텝 수
    private long cityCount;           // 참여한 이벤트의 도시 수 (distinct)
    private long countryCount;        // 참여한 이벤트의 국가 수 (distinct)
    private long completedCollectionCount;
    private long activeCollectionsCount; // ongoing 상태 컬렉션 수

    @Builder.Default
    private String totalDistanceLabel = "— km";
}
