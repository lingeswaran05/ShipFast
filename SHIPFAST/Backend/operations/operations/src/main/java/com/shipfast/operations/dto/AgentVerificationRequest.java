package com.shipfast.operations.dto;

import lombok.Data;

@Data
public class AgentVerificationRequest {
    private Boolean verified;
    private String verifiedBy;
    private String verificationNotes;
}
