package com.landin.backend.domain.blockchain.fabric;

import com.landin.backend.config.FabricProperties;
import io.grpc.ChannelCredentials;
import io.grpc.Grpc;
import io.grpc.ManagedChannel;
import io.grpc.TlsChannelCredentials;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.client.CommitException;
import org.hyperledger.fabric.client.CommitStatusException;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.EndorseException;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.GatewayException;
import org.hyperledger.fabric.client.Network;
import org.hyperledger.fabric.client.SubmitException;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Signers;
import org.hyperledger.fabric.client.identity.X509Identity;
import org.springframework.stereotype.Component;

import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

/**
 * Hyperledger Fabric Gateway 연결을 관리하는 팩토리.
 *
 * <p>fabric.enabled=false이거나 cert/key 경로 미설정 시 모든 chaincode 호출은 skip된다.
 * 백엔드는 Fabric 없이도 동작 가능하게 설계되어 있다 (기획서 Phase 1 MVP 정책).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FabricGatewayFactory {

    private final FabricProperties properties;

    private Gateway gateway;
    private ManagedChannel grpcChannel;

    @PostConstruct
    public void init() {
        if (!properties.isConfigured()) {
            log.info("[FabricGateway] Fabric integration disabled or not configured — chaincode calls will be skipped");
            return;
        }

        try {
            grpcChannel = buildGrpcChannel();
            gateway = buildGateway(grpcChannel);
            log.info("[FabricGateway] Connected to Fabric peer. endpoint={}, channel={}, chaincode={}",
                    properties.getPeerEndpoint(), properties.getChannelName(), properties.getChaincodeName());
        } catch (Throwable e) {
            log.error("[FabricGateway] Failed to connect to Fabric peer — running without Fabric. error={}", e.getMessage(), e);
            closeQuietly();
        }
    }

    @PreDestroy
    public void destroy() {
        closeQuietly();
    }

    public boolean isAvailable() {
        return gateway != null;
    }

    /**
     * submitTransaction을 실행하고 결과 바이트를 반환한다.
     * Fabric 미연결 시 null을 반환한다.
     */
    public byte[] submit(String functionName, String... args) {
        if (!isAvailable()) {
            log.warn("[FabricGateway] submit skipped (Fabric not available). function={}", functionName);
            return null;
        }
        try {
            Contract contract = getContract();
            byte[] result = contract.submitTransaction(functionName, args);
            log.debug("[FabricGateway] submit succeeded. function={}", functionName);
            return result;
        } catch (EndorseException | SubmitException | CommitStatusException e) {
            throw new FabricException("[Fabric] Transaction failed. function=" + functionName + " details=" + e.getMessage(), e);
        } catch (CommitException e) {
            throw new FabricException("[Fabric] Transaction commit failed. function=" + functionName + " code=" + e.getCode() + " details=" + e.getMessage(), e);
        }
    }

    /**
     * evaluateTransaction을 실행하고 결과 바이트를 반환한다.
     * Fabric 미연결 시 null을 반환한다.
     */
    public byte[] evaluate(String functionName, String... args) {
        if (!isAvailable()) {
            log.warn("[FabricGateway] evaluate skipped (Fabric not available). function={}", functionName);
            return null;
        }
        try {
            Contract contract = getContract();
            byte[] result = contract.evaluateTransaction(functionName, args);
            log.debug("[FabricGateway] evaluate succeeded. function={}", functionName);
            return result;
        } catch (GatewayException e) {
            throw new FabricException("[Fabric] Query failed. function=" + functionName + " details=" + e.getMessage(), e);
        }
    }

    // ─── private helpers ────────────────────────────────────────────────────

    private Contract getContract() {
        Network network = gateway.getNetwork(properties.getChannelName());
        return network.getContract(properties.getChaincodeName());
    }

    private ManagedChannel buildGrpcChannel() throws IOException {
        Path tlsCertPath = Path.of(properties.getTlsCertPath());
        ChannelCredentials tlsCredentials = TlsChannelCredentials.newBuilder()
                .trustManager(tlsCertPath.toFile())
                .build();
        return Grpc.newChannelBuilder(properties.getPeerEndpoint(), tlsCredentials).build();
    }

    private Gateway buildGateway(ManagedChannel channel) throws Exception {
        X509Certificate certificate = Identities.readX509Certificate(new FileReader(properties.getUserCertPath()));
        PrivateKey privateKey = Identities.readPrivateKey(new FileReader(properties.getUserKeyPath()));
        X509Identity identity = new X509Identity(properties.getMspId(), certificate);

        return Gateway.newInstance()
                .identity(identity)
                .signer(Signers.newPrivateKeySigner(privateKey))
                .connection(channel)
                .evaluateOptions(options -> options.withDeadlineAfter(properties.getDeadlineSeconds(), TimeUnit.SECONDS))
                .submitOptions(options -> options.withDeadlineAfter(properties.getDeadlineSeconds(), TimeUnit.SECONDS))
                .connect();
    }

    private void closeQuietly() {
        if (gateway != null) {
            try { gateway.close(); } catch (Exception ignored) {}
            gateway = null;
        }
        if (grpcChannel != null) {
            try { grpcChannel.shutdownNow().awaitTermination(5, TimeUnit.SECONDS); } catch (Exception ignored) {}
            grpcChannel = null;
        }
    }
}
