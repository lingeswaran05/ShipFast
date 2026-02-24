package com.shipfast.shipment.entity;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    private String fullName;
    private String phoneNumber;
    private String addressLine;
    private String city;
    private String pincode;
}
