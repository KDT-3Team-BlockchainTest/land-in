package com.landin.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "blockchain")
public class BlockchainProperties {

    private boolean enabled = false;
    private long chainId = 560048L;
    private String rpcUrl = "https://rpc.hoodi.ethpandaops.io";
    private String contractAddress;
    private String minterPrivateKey;
    private String mintFunctionName = "safeMint";
    private String gasPriceWei;
    private long gasLimit = 500_000L;
    private int receiptPollAttempts = 20;
    private long receiptPollIntervalMillis = 3_000L;

    public boolean isConfigured() {
        return enabled
                && hasText(rpcUrl)
                && hasText(contractAddress)
                && hasText(minterPrivateKey)
                && hasText(mintFunctionName);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
