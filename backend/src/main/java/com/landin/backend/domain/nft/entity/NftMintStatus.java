package com.landin.backend.domain.nft.entity;

public enum NftMintStatus {
    OFFCHAIN_ONLY,
    PENDING_WALLET,
    PENDING_ONCHAIN,
    MINTED_ONCHAIN,
    FAILED_ONCHAIN
}
