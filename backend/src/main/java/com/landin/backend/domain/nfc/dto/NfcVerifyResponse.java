package com.landin.backend.domain.nfc.dto;

import com.landin.backend.domain.nft.dto.UserNftResponse;
import com.landin.backend.domain.reward.dto.UserRewardResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NfcVerifyResponse {
    private UserNftResponse mintedNft;
    private boolean rewardIssued;
    private UserRewardResponse reward;
}
