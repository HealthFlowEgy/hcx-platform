package org..hcx.models;

import org..common.utils.SlugUtils;

import java.util.Map;

import static org..common.utils.Constants.PARTICIPANT_CODE;
import static org..common.utils.Constants.PRIMARY_EMAIL;

public class Participant {

    private final Map<String, Object> requestBody;

    public Participant(Map<String, Object> requestbody) {
        this.requestBody = requestbody;
    }

    public String getprimaryEmail() {
        return (String) requestBody.get(PRIMARY_EMAIL);
    }

    public String generateCode(String primaryEmail, String fieldSeparator, String hcxInstanceName) {
        String participantCode = SlugUtils.makeSlug(primaryEmail, "", fieldSeparator, hcxInstanceName);
        requestBody.put(PARTICIPANT_CODE, participantCode);
        return participantCode;
    }

    public String getParticipantCode() {
        return (String) requestBody.get(PARTICIPANT_CODE);
    }
}
