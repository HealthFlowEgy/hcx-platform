package org..hcx.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org..auditindexer.function.AuditIndexer;
import org..common.dto.Request;
import org..common.helpers.EventGenerator;
import org..common.utils.Constants;
import org..common.utils.JSONUtils;
import org..common.utils.PayloadUtils;
import org..kafka.client.IEventService;
import org..postgresql.IDatabaseService;

import java.util.Map;

import static org..common.utils.Constants.KAFKA_TOPIC_PAYLOAD;
import static org..common.utils.Constants.QUEUED_STATUS;

@Component
public class EventHandler {

    private static final Logger logger = LoggerFactory.getLogger(EventHandler.class);

    @Autowired
    protected Environment env;

    @Autowired
    private IEventService kafkaClient;

    @Autowired
    protected IDatabaseService postgreSQLClient;

    @Autowired
    protected AuditIndexer auditIndexer;

    @Autowired
    protected EventGenerator eventGenerator;

    @Value("${postgres.tablename}")
    private String postgresTableName;

    @Value("${kafka.topic.audit}")
    private String auditTopic;

    public void processAndSendEvent(String metadataTopic, Request request) throws Exception {
        String payloadTopic = env.getProperty(KAFKA_TOPIC_PAYLOAD);
        String key = request.getHcxSenderCode();
        // TODO: check and remove writing payload event to kafka
        String payloadEvent = eventGenerator.generatePayloadEvent(request);
        String metadataEvent = eventGenerator.generateMetadataEvent(request);
        String query = String.format("INSERT INTO %s (mid,data,action,status,retrycount,lastupdatedon) VALUES ('%s','%s','%s','%s',%d,%d)",
                postgresTableName, request.getMid(), JSONUtils.serialize(PayloadUtils.removeParticipantDetails(request.getPayload())),
                request.getApiAction(), QUEUED_STATUS, 0, System.currentTimeMillis());
        logger.debug("Mid: " + request.getMid() + " :: Event: " + metadataEvent);
        postgreSQLClient.execute(query);
        kafkaClient.send(payloadTopic, key, payloadEvent);
        kafkaClient.send(metadataTopic, key, metadataEvent);
        auditIndexer.createDocument(eventGenerator.generateAuditEvent(request));
    }

    public void createAudit(Map<String,Object> event) throws Exception {
        kafkaClient.send(auditTopic , (String) ((Map<String,Object>) event.get(Constants.OBJECT)).get(Constants.TYPE) , JSONUtils.serialize(event));
    }

}
