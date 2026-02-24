package com.shipfast.operations.dto;

import lombok.Data;

@Data
public class AgentProfileRequest {
    private String licenseNumber;
    private String aadharNumber;
    private String vehicleNumber;
    private String rcBookNumber;
    private String bloodType;
    private Boolean organDonor;
    private String shiftTiming;
    private String profileImage;
    private String verificationStatus;
    private String verifiedBy;
    private String verificationNotes;
    private String availabilityStatus;
    private Long deliveredCount;
    private Long failedCount;
    private Long inTransitCount;
    private String bankAccountHolder;
    private String bankAccountNumber;
    private String bankIfsc;
    private String bankName;
    private Double salaryBalance;
    private Double totalSalaryCredited;
    private Double totalSalaryDebited;
}
