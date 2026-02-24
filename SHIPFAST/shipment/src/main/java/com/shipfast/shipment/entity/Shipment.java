package com.shipfast.shipment.entity;

import com.shipfast.shipment.entity.enums.PaymentStatus;
import com.shipfast.shipment.entity.enums.ServiceType;
import com.shipfast.shipment.entity.enums.ShipmentStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "shipments")
public class Shipment {

    @Id
    private String shipmentId;

    private String trackingNumber;
    private Long customerId;

    private ShipmentStatus status;
    private ServiceType serviceType;
    private String zoneType;

    private Address senderAddress;
    private Address receiverAddress;

    private PackageDetails packageDetails;
    private PriceBreakdown priceBreakdown;

    private String currentHubId;

    private LocalDateTime bookingDate;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime actualDeliveryDate;

    private PaymentStatus paymentStatus;
}
