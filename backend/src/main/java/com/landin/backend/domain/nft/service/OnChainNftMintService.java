package com.landin.backend.domain.nft.service;

import com.landin.backend.config.BlockchainProperties;
import com.landin.backend.domain.nft.entity.NftMintStatus;
import com.landin.backend.domain.nft.entity.UserNft;
import com.landin.backend.domain.nft.repository.UserNftRepository;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthGasPrice;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.utils.Numeric;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnChainNftMintService {

    private static final Event TRANSFER_EVENT = new Event(
            "Transfer",
            List.of(
                    new TypeReference<Address>(true) {},
                    new TypeReference<Address>(true) {},
                    new TypeReference<Uint256>(true) {}
            )
    );

    private final BlockchainProperties blockchainProperties;
    private final UserNftRepository userNftRepository;
    private final UserRepository userRepository;
    private final PlatformTransactionManager transactionManager;

    @Value("${app.public-base-url:http://localhost:8080}")
    private String publicBaseUrl;

    public void prepareMintState(UserNft userNft) {
        String tokenUri = buildMetadataUrl(Objects.requireNonNull(userNft.getId(), "NFT id must not be null"));
        String contractAddress = normalize(blockchainProperties.getContractAddress());
        Long chainId = blockchainProperties.getChainId();

        if (!hasWallet(userNft.getUser())) {
            userNft.markPendingWallet(tokenUri, contractAddress, chainId, "Connect a Hoodi wallet to continue on-chain minting.");
            return;
        }

        String metadataIssue = validateMetadataBaseUrl();
        if (metadataIssue != null) {
            userNft.markPendingOnChain(tokenUri, contractAddress, chainId, metadataIssue);
            return;
        }

        if (!blockchainProperties.isConfigured()) {
            userNft.markPendingOnChain(tokenUri, contractAddress, chainId, "On-chain minting is not configured on the server yet.");
            return;
        }

        userNft.markPendingOnChain(tokenUri, contractAddress, chainId, "Mint queued and will run after the NFC transaction commits.");
    }

    public void scheduleMintAfterCommit(UUID userNftId) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            syncMintStateById(userNftId);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                syncMintStateById(userNftId);
            }
        });
    }

    public void scheduleRetryAfterCommit(UUID userId) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            retryMintsForUser(userId);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                retryMintsForUser(userId);
            }
        });
    }

    public void syncMintState(UserNft userNft) {
        String tokenUri = buildMetadataUrl(Objects.requireNonNull(userNft.getId(), "NFT id must not be null"));
        String contractAddress = normalize(blockchainProperties.getContractAddress());
        Long chainId = blockchainProperties.getChainId();

        if (!hasWallet(userNft.getUser())) {
            userNft.markPendingWallet(tokenUri, contractAddress, chainId, "Connect a Hoodi wallet to continue on-chain minting.");
            return;
        }

        String metadataIssue = validateMetadataBaseUrl();
        if (metadataIssue != null) {
            userNft.markPendingOnChain(tokenUri, contractAddress, chainId, metadataIssue);
            return;
        }

        if (!blockchainProperties.isConfigured()) {
            userNft.markPendingOnChain(tokenUri, contractAddress, chainId, "On-chain minting is not configured on the server yet.");
            return;
        }

        try {
            MintResult result = mintOnChain(userNft.getUser().getWalletAddress(), tokenUri);
            userNft.markOnChainMinted(
                    tokenUri,
                    result.contractAddress(),
                    result.chainId(),
                    result.tokenId(),
                    result.transactionHash(),
                    result.mintedAt()
            );
            log.info(
                    "[OnChainNftMintService] On-chain mint succeeded. nftId={}, userId={}, tokenId={}, txHash={}",
                    userNft.getId(),
                    userNft.getUser().getId(),
                    result.tokenId(),
                    result.transactionHash()
            );
        } catch (Exception exception) {
            String failureReason = abbreviate(exception.getMessage());
            log.error(
                    "[OnChainNftMintService] On-chain mint failed. nftId={}, userId={}, walletAddress={}, reason={}",
                    userNft.getId(),
                    userNft.getUser().getId(),
                    userNft.getUser().getWalletAddress(),
                    failureReason,
                    exception
            );
            userNft.markOnChainFailed(tokenUri, contractAddress, chainId, failureReason);
        }
    }

    public int retryMintsForUser(UUID userId) {
        Integer retriedCount = newTransactionTemplate().execute(status -> {
            User user = userRepository.findById(Objects.requireNonNull(userId, "User id must not be null")).orElse(null);
            if (user == null || !hasWallet(user)) {
                return 0;
            }

            List<UserNft> pendingNfts = userNftRepository.findByUserIdAndMintStatusIn(
                    userId,
                    List.of(NftMintStatus.PENDING_WALLET, NftMintStatus.PENDING_ONCHAIN, NftMintStatus.FAILED_ONCHAIN)
            );

            pendingNfts.forEach(this::syncMintState);
            return pendingNfts.size();
        });

        return retriedCount == null ? 0 : retriedCount;
    }

    public void syncMintStateById(UUID userNftId) {
        newTransactionTemplate().executeWithoutResult(status -> userNftRepository.findDetailedById(
                Objects.requireNonNull(userNftId, "NFT id must not be null")
        ).ifPresentOrElse(
                this::syncMintState,
                () -> log.warn("[OnChainNftMintService] NFT not found for deferred mint. nftId={}", userNftId)
        ));
    }

    public String buildMetadataUrl(UUID nftId) {
        return resolveMetadataBaseUrl() + "/api/nfts/" + nftId + "/metadata";
    }

    private MintResult mintOnChain(String recipientWalletAddress, String tokenUri) throws Exception {
        Web3j web3j = Web3j.build(new HttpService(blockchainProperties.getRpcUrl()));

        try {
            Credentials credentials = Credentials.create(blockchainProperties.getMinterPrivateKey());
            RawTransactionManager transactionManager = new RawTransactionManager(
                    web3j,
                    credentials,
                    blockchainProperties.getChainId()
            );

            Function mintFunction = new Function(
                    normalize(blockchainProperties.getMintFunctionName()),
                    List.of(new Address(recipientWalletAddress), new Utf8String(tokenUri)),
                    Collections.emptyList()
            );

            EthSendTransaction transaction = transactionManager.sendTransaction(
                    resolveGasPrice(web3j),
                    BigInteger.valueOf(blockchainProperties.getGasLimit()),
                    normalize(blockchainProperties.getContractAddress()),
                    FunctionEncoder.encode(mintFunction),
                    BigInteger.ZERO
            );

            if (transaction.hasError()) {
                throw new IllegalStateException(transaction.getError().getMessage());
            }

            String transactionHash = Objects.requireNonNull(transaction.getTransactionHash(), "Transaction hash must not be null");
            TransactionReceipt receipt = waitForReceipt(web3j, transactionHash);

            return new MintResult(
                    normalize(blockchainProperties.getContractAddress()),
                    blockchainProperties.getChainId(),
                    extractTokenId(receipt),
                    transactionHash,
                    LocalDateTime.now()
            );
        } finally {
            web3j.shutdown();
        }
    }

    private BigInteger resolveGasPrice(Web3j web3j) throws Exception {
        String configuredGasPrice = normalize(blockchainProperties.getGasPriceWei());
        if (configuredGasPrice != null) {
            return new BigInteger(configuredGasPrice);
        }

        EthGasPrice gasPrice = web3j.ethGasPrice().send();
        return gasPrice.getGasPrice();
    }

    private TransactionReceipt waitForReceipt(Web3j web3j, String transactionHash) throws Exception {
        for (int attempt = 0; attempt < blockchainProperties.getReceiptPollAttempts(); attempt++) {
            EthGetTransactionReceipt response = web3j.ethGetTransactionReceipt(transactionHash).send();
            Optional<TransactionReceipt> receipt = response.getTransactionReceipt();
            if (receipt.isPresent()) {
                return receipt.get();
            }

            Thread.sleep(blockchainProperties.getReceiptPollIntervalMillis());
        }

        throw new IllegalStateException("Timed out while waiting for the mint transaction receipt.");
    }

    private String extractTokenId(TransactionReceipt receipt) {
        String transferSignature = EventEncoder.encode(TRANSFER_EVENT);
        for (Log logEntry : receipt.getLogs()) {
            if (!normalize(blockchainProperties.getContractAddress()).equalsIgnoreCase(logEntry.getAddress())) {
                continue;
            }

            List<String> topics = logEntry.getTopics();
            if (topics.size() < 4 || !transferSignature.equalsIgnoreCase(topics.get(0))) {
                continue;
            }

            return Numeric.toBigInt(topics.get(3)).toString();
        }

        return null;
    }

    private boolean hasWallet(User user) {
        return normalize(user.getWalletAddress()) != null;
    }

    private String validateMetadataBaseUrl() {
        String normalized = normalize(resolveMetadataBaseUrl());
        if (normalized == null) {
            return "Set APP_PUBLIC_BASE_URL to a public URL before on-chain minting.";
        }

        try {
            URI uri = URI.create(normalized);
            String scheme = normalize(uri.getScheme());
            String host = normalize(uri.getHost());

            if (host == null || scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                return "APP_PUBLIC_BASE_URL must be a valid http(s) URL.";
            }

            if (isPrivateHost(host)) {
                return "APP_PUBLIC_BASE_URL must be publicly reachable so token metadata can be resolved.";
            }
        } catch (IllegalArgumentException exception) {
            return "APP_PUBLIC_BASE_URL must be a valid http(s) URL.";
        }

        return null;
    }

    private String resolveMetadataBaseUrl() {
        String requestBaseUrl = resolveBaseUrlFromCurrentRequest();
        if (requestBaseUrl != null) {
            return requestBaseUrl;
        }

        return normalizeBaseUrl(publicBaseUrl);
    }

    private String resolveBaseUrlFromCurrentRequest() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (!(requestAttributes instanceof ServletRequestAttributes servletRequestAttributes)) {
            return null;
        }

        HttpServletRequest request = servletRequestAttributes.getRequest();
        String host = firstHeaderValue(request.getHeader("X-Forwarded-Host"));
        String scheme = firstHeaderValue(request.getHeader("X-Forwarded-Proto"));

        if (host != null) {
            String resolvedScheme = scheme != null ? scheme : "https";
            return normalizeBaseUrl(resolvedScheme + "://" + host);
        }

        String requestHost = normalize(request.getServerName());
        String requestScheme = scheme != null ? scheme : normalize(request.getScheme());
        if (requestHost == null || requestScheme == null) {
            return null;
        }

        int port = request.getServerPort();
        boolean defaultPort = ("http".equalsIgnoreCase(requestScheme) && port == 80)
                || ("https".equalsIgnoreCase(requestScheme) && port == 443);
        String portSuffix = (port > 0 && !defaultPort) ? ":" + port : "";
        return normalizeBaseUrl(requestScheme + "://" + requestHost + portSuffix);
    }

    private String firstHeaderValue(String headerValue) {
        String normalized = normalize(headerValue);
        if (normalized == null) {
            return null;
        }

        int separatorIndex = normalized.indexOf(",");
        return separatorIndex >= 0 ? normalized.substring(0, separatorIndex).trim() : normalized;
    }

    private boolean isPrivateHost(String host) {
        String lowered = host.toLowerCase();
        if (lowered.equals("localhost") || lowered.equals("0.0.0.0") || lowered.endsWith(".local")) {
            return true;
        }

        if (lowered.startsWith("127.") || lowered.startsWith("10.") || lowered.startsWith("192.168.")) {
            return true;
        }

        if (!lowered.startsWith("172.")) {
            return false;
        }

        String[] parts = lowered.split("\\.");
        if (parts.length < 2) {
            return false;
        }

        try {
            int secondOctet = Integer.parseInt(parts[1]);
            return secondOctet >= 16 && secondOctet <= 31;
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    private TransactionTemplate newTransactionTemplate() {
        return new TransactionTemplate(transactionManager);
    }

    private String normalizeBaseUrl(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return "http://localhost:8080";
        }

        return normalized.replaceAll("/+$", "");
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String abbreviate(String value) {
        if (value == null || value.isBlank()) {
            return "Unknown minting error";
        }

        return value.length() > 500 ? value.substring(0, 500) : value;
    }

    private record MintResult(
            String contractAddress,
            long chainId,
            String tokenId,
            String transactionHash,
            LocalDateTime mintedAt
    ) {
    }
}
