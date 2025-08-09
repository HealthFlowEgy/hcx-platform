package org.swasth.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.swasth.common.utils.JSONUtils;
import org.swasth.postgresql.IDatabaseService;

import java.util.*;

/**
 * Local implementation of Registry Service that uses PostgreSQL database
 * instead of external registry service for complete independence
 */
@Service
public class LocalRegistryService {

    @Autowired
    private IDatabaseService databaseService;

    private static final String PARTICIPANTS_TABLE = "participants";
    private static final String ORGANIZATIONS_TABLE = "organizations";

    /**
     * Get participant details from local database instead of external registry
     * @param requestBody JSON search criteria
     * @return List of participant details
     * @throws Exception if database operation fails
     */
    public List<Map<String, Object>> getDetails(String requestBody) throws Exception {
        try {
            // Parse the search criteria
            Map<String, Object> searchCriteria = JSONUtils.deserialize(requestBody, Map.class);
            Map<String, Object> filters = (Map<String, Object>) searchCriteria.get("filters");
            
            if (filters == null) {
                return new ArrayList<>();
            }

            // Build SQL query based on filters
            StringBuilder queryBuilder = new StringBuilder("SELECT * FROM " + PARTICIPANTS_TABLE + " WHERE 1=1");
            List<Object> parameters = new ArrayList<>();

            // Handle participant_code filter
            if (filters.containsKey("participant_code")) {
                Map<String, Object> participantCodeFilter = (Map<String, Object>) filters.get("participant_code");
                if (participantCodeFilter.containsKey("eq")) {
                    queryBuilder.append(" AND participant_code = ?");
                    parameters.add(participantCodeFilter.get("eq"));
                }
            }

            // Handle status filter
            if (filters.containsKey("status")) {
                Map<String, Object> statusFilter = (Map<String, Object>) filters.get("status");
                if (statusFilter.containsKey("eq")) {
                    queryBuilder.append(" AND status = ?");
                    parameters.add(statusFilter.get("eq"));
                }
            }

            // Handle roles filter
            if (filters.containsKey("roles")) {
                Map<String, Object> rolesFilter = (Map<String, Object>) filters.get("roles");
                if (rolesFilter.containsKey("in")) {
                    List<String> roles = (List<String>) rolesFilter.get("in");
                    queryBuilder.append(" AND roles && ?");
                    parameters.add(roles.toArray(new String[0]));
                }
            }

            // Execute query
            String query = queryBuilder.toString();
            List<Map<String, Object>> results = databaseService.executeQuery(query, parameters.toArray());

            return results != null ? results : new ArrayList<>();

        } catch (Exception e) {
            throw new Exception("Error fetching participant details from local registry: " + e.getMessage(), e);
        }
    }

    /**
     * Create a new participant in local registry
     * @param participantData Participant information
     * @return Created participant details
     * @throws Exception if creation fails
     */
    public Map<String, Object> createParticipant(Map<String, Object> participantData) throws Exception {
        try {
            String participantCode = generateParticipantCode();
            participantData.put("participant_code", participantCode);
            participantData.put("created_at", System.currentTimeMillis());
            participantData.put("updated_at", System.currentTimeMillis());
            participantData.put("status", "active");

            String insertQuery = buildInsertQuery(PARTICIPANTS_TABLE, participantData);
            databaseService.executeUpdate(insertQuery, participantData.values().toArray());

            return participantData;
        } catch (Exception e) {
            throw new Exception("Error creating participant in local registry: " + e.getMessage(), e);
        }
    }

    /**
     * Update participant in local registry
     * @param participantCode Participant code to update
     * @param updateData Updated participant information
     * @return Updated participant details
     * @throws Exception if update fails
     */
    public Map<String, Object> updateParticipant(String participantCode, Map<String, Object> updateData) throws Exception {
        try {
            updateData.put("updated_at", System.currentTimeMillis());
            
            StringBuilder updateQuery = new StringBuilder("UPDATE " + PARTICIPANTS_TABLE + " SET ");
            List<Object> parameters = new ArrayList<>();
            
            for (Map.Entry<String, Object> entry : updateData.entrySet()) {
                updateQuery.append(entry.getKey()).append(" = ?, ");
                parameters.add(entry.getValue());
            }
            
            // Remove trailing comma and space
            updateQuery.setLength(updateQuery.length() - 2);
            updateQuery.append(" WHERE participant_code = ?");
            parameters.add(participantCode);

            databaseService.executeUpdate(updateQuery.toString(), parameters.toArray());

            // Return updated participant
            return getParticipantByCode(participantCode);
        } catch (Exception e) {
            throw new Exception("Error updating participant in local registry: " + e.getMessage(), e);
        }
    }

    /**
     * Get participant by code
     * @param participantCode Participant code
     * @return Participant details
     * @throws Exception if not found
     */
    public Map<String, Object> getParticipantByCode(String participantCode) throws Exception {
        String query = "SELECT * FROM " + PARTICIPANTS_TABLE + " WHERE participant_code = ?";
        List<Map<String, Object>> results = databaseService.executeQuery(query, new Object[]{participantCode});
        
        if (results == null || results.isEmpty()) {
            throw new Exception("Participant not found: " + participantCode);
        }
        
        return results.get(0);
    }

    /**
     * Delete participant from local registry
     * @param participantCode Participant code to delete
     * @throws Exception if deletion fails
     */
    public void deleteParticipant(String participantCode) throws Exception {
        try {
            String deleteQuery = "DELETE FROM " + PARTICIPANTS_TABLE + " WHERE participant_code = ?";
            databaseService.executeUpdate(deleteQuery, new Object[]{participantCode});
        } catch (Exception e) {
            throw new Exception("Error deleting participant from local registry: " + e.getMessage(), e);
        }
    }

    /**
     * Initialize local registry tables if they don't exist
     */
    public void initializeLocalRegistry() throws Exception {
        try {
            // Create participants table
            String createParticipantsTable = """
                CREATE TABLE IF NOT EXISTS participants (
                    id SERIAL PRIMARY KEY,
                    participant_code VARCHAR(255) UNIQUE NOT NULL,
                    participant_name VARCHAR(255) NOT NULL,
                    primary_email VARCHAR(255),
                    primary_mobile VARCHAR(20),
                    secondary_mobile VARCHAR(20),
                    roles TEXT[],
                    status VARCHAR(50) DEFAULT 'active',
                    endpoint_url VARCHAR(500),
                    encryption_cert TEXT,
                    signing_cert TEXT,
                    street_address VARCHAR(500),
                    city VARCHAR(100),
                    governorate VARCHAR(100),
                    postal_code VARCHAR(10),
                    country VARCHAR(50) DEFAULT 'Egypt',
                    created_at BIGINT,
                    updated_at BIGINT,
                    additional_info JSONB
                )
            """;

            // Create organizations table
            String createOrganizationsTable = """
                CREATE TABLE IF NOT EXISTS organizations (
                    id SERIAL PRIMARY KEY,
                    organization_code VARCHAR(255) UNIQUE NOT NULL,
                    organization_name VARCHAR(255) NOT NULL,
                    organization_type VARCHAR(100),
                    contact_email VARCHAR(255),
                    contact_phone VARCHAR(20),
                    street_address VARCHAR(500),
                    city VARCHAR(100),
                    governorate VARCHAR(100),
                    postal_code VARCHAR(10),
                    country VARCHAR(50) DEFAULT 'Egypt',
                    status VARCHAR(50) DEFAULT 'active',
                    created_at BIGINT,
                    updated_at BIGINT,
                    additional_info JSONB
                )
            """;

            databaseService.executeUpdate(createParticipantsTable, new Object[]{});
            databaseService.executeUpdate(createOrganizationsTable, new Object[]{});

            // Insert default HCX registry entry if not exists
            insertDefaultHCXRegistry();

        } catch (Exception e) {
            throw new Exception("Error initializing local registry: " + e.getMessage(), e);
        }
    }

    /**
     * Insert default HCX registry entry
     */
    private void insertDefaultHCXRegistry() throws Exception {
        String checkQuery = "SELECT COUNT(*) as count FROM " + PARTICIPANTS_TABLE + " WHERE participant_code = ?";
        List<Map<String, Object>> results = databaseService.executeQuery(checkQuery, new Object[]{"1-d2d56996-1b77-4abb-b9e9-0e6e7343c72e"});
        
        if (results != null && !results.isEmpty()) {
            Long count = (Long) results.get(0).get("count");
            if (count == 0) {
                Map<String, Object> hcxRegistry = new HashMap<>();
                hcxRegistry.put("participant_code", "1-d2d56996-1b77-4abb-b9e9-0e6e7343c72e");
                hcxRegistry.put("participant_name", "HCX Registry");
                hcxRegistry.put("primary_email", "registry@hcx.local");
                hcxRegistry.put("roles", new String[]{"registry", "hcx"});
                hcxRegistry.put("status", "active");
                hcxRegistry.put("endpoint_url", "http://localhost:8080");
                hcxRegistry.put("created_at", System.currentTimeMillis());
                hcxRegistry.put("updated_at", System.currentTimeMillis());

                createParticipant(hcxRegistry);
            }
        }
    }

    /**
     * Generate unique participant code
     */
    private String generateParticipantCode() {
        return "1-" + UUID.randomUUID().toString();
    }

    /**
     * Build INSERT query dynamically
     */
    private String buildInsertQuery(String tableName, Map<String, Object> data) {
        StringBuilder query = new StringBuilder("INSERT INTO " + tableName + " (");
        StringBuilder values = new StringBuilder(" VALUES (");
        
        for (String key : data.keySet()) {
            query.append(key).append(", ");
            values.append("?, ");
        }
        
        // Remove trailing commas
        query.setLength(query.length() - 2);
        values.setLength(values.length() - 2);
        
        query.append(")").append(values).append(")");
        return query.toString();
    }
}

