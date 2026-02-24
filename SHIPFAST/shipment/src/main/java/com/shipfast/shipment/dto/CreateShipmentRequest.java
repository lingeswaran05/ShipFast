package com.shipfast.shipment.dto;

import com.shipfast.shipment.entity.Address;
import com.shipfast.shipment.entity.PackageDetails;
import com.shipfast.shipment.entity.enums.ServiceType;
import lombok.Data;

@Data
public class CreateShipmentRequest {

    private Long customerId;
    private ServiceType serviceType;
    private String zoneType;
    private Address senderAddress;
    private Address receiverAddress;
    private PackageDetails packageDetails;
}
