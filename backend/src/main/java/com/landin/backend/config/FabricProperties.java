package com.landin.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "fabric")
public class FabricProperties {

    /** Fabric 연동 활성화 여부 (기본 false - 비활성화 시 체인코드 호출 건너뜀) */
    private boolean enabled = false;

    /** 채널명 (dev-mode 기본값: channel1) */
    private String channelName = "channel1";

    /** 체인코드명 */
    private String chaincodeName = "visitledger";

    /** MSP ID */
    private String mspId = "Org1MSP";

    /**
     * Peer gRPC 엔드포인트 (스킴 없이 host:port 형식)
     * Docker 내부: peer0.org1.example.com:7051
     * 로컬 포트포워딩: localhost:7051
     */
    private String peerEndpoint = "localhost:7051";

    /**
     * Peer TLS CA 인증서 경로 (PEM 파일)
     * connection-org1.json의 tlsCACerts에 해당
     * 예: /opt/fabric/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
     */
    private String tlsCertPath;

    /**
     * 사용자 X.509 인증서 경로 (PEM 파일)
     * wallet에서 사용자 등록 후 생성되는 certificate.pem
     */
    private String userCertPath;

    /**
     * 사용자 개인키 경로 (PEM 파일)
     * wallet에서 사용자 등록 후 생성되는 keystore/*.pem
     */
    private String userKeyPath;

    /** gRPC 트랜잭션 타임아웃 (초) */
    private long deadlineSeconds = 30;

    /** Fabric 연동이 실제로 동작 가능한 상태인지 확인 */
    public boolean isConfigured() {
        return enabled
                && hasText(peerEndpoint)
                && hasText(tlsCertPath)
                && hasText(userCertPath)
                && hasText(userKeyPath);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
