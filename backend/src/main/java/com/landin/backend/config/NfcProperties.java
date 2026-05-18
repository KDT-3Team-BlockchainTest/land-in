package com.landin.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "nfc")
public class NfcProperties {

    private Sdm sdm = new Sdm();

    @Getter
    @Setter
    public static class Sdm {
        /** SUN/SDM 검증 활성화 여부 */
        private boolean enabled = false;

        /** PICC 데이터 복호화용 AES-128 키 (hex, 32자) — NXP SDMMetaReadKey */
        private String encKey;

        /** CMAC 검증용 AES-128 키 (hex, 32자) — NXP SDMFileReadKey */
        private String macKey;

        public boolean isConfigured() {
            return enabled
                    && hasText(encKey) && encKey.trim().length() == 32
                    && hasText(macKey) && macKey.trim().length() == 32;
        }

        private boolean hasText(String value) {
            return value != null && !value.isBlank();
        }
    }
}
