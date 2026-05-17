package com.landin.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({BlockchainProperties.class, FabricProperties.class})
public class BlockchainConfig {
}
