package com.shipfast.shipment.entity;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageDetails {

    private double weightKg;
    private double lengthCm;
    private double widthCm;
    private double heightCm;
    private double volumetricWeight;
    private double declaredValue;
    private String contentType;
}
