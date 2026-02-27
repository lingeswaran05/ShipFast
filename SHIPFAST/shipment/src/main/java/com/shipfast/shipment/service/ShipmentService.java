package com.shipfast.shipment.service;

import com.shipfast.shipment.dto.CreateShipmentRequest;
import com.shipfast.shipment.entity.Shipment;
import com.shipfast.shipment.entity.enums.ShipmentStatus;

import java.util.List;

public interface ShipmentService {

    Shipment createShipment(CreateShipmentRequest request);

    Shipment getByTrackingNumber(String trackingNumber);

    List<Shipment> getByCustomerId(Long customerId);

    Shipment updateStatus(String trackingNumber, ShipmentStatus status, Boolean paymentSuccess);
}
