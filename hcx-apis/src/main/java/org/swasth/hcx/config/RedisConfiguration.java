package org..hcx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org..redis.cache.RedisCache;

@Configuration
public class RedisConfiguration {

    @Value("${redis.host:localhost}")
    private String redisHost;

    @Value("${redis.port:6379}")
    private int redisPort;

    @Bean
    public RedisCache redisCache() {
        return new RedisCache(redisHost, redisPort);
    }

}
