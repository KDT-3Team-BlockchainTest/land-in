package com.landin.backend.domain.blockchain.fabric;

/** Fabric 체인코드 호출 실패 시 던지는 런타임 예외. */
public class FabricException extends RuntimeException {

    public FabricException(String message, Throwable cause) {
        super(message, cause);
    }
}
