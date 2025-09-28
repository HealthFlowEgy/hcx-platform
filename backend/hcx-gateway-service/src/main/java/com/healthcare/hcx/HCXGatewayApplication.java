package com.healthcare.hcx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class HCXGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(HCXGatewayApplication.class, args);
    }
}
