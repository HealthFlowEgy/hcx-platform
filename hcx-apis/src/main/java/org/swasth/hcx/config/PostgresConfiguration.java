package org..hcx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org..common.exception.ClientException;
import org..postgresql.IDatabaseService;
import org..postgresql.PostgreSQLClient;

import java.sql.SQLException;

@Configuration
public class PostgresConfiguration {

    @Value("${postgres.url}")
    private String postgresUrl;

    @Value("${postgres.user}")
    private String postgresUser;

    @Value("${postgres.password}")
    private String postgresPassword;

    @Bean
    public IDatabaseService postgreSQLClient() throws ClientException, SQLException {
        return new PostgreSQLClient(postgresUrl, postgresUser, postgresPassword);
    }

}
