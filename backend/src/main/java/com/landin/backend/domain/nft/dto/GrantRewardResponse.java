package com.landin.backend.domain.nft.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GrantRewardResponse {
    private int pointAmount;
    private String rewardTxId;
    private String fabricTxId;
    private String mintStatus;
}
