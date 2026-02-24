package com.shipfast.shipment.service;

import com.shipfast.shipment.entity.TrackingEvent;
import com.shipfast.shipment.entity.enums.ShipmentStatus;

import java.util.List;

public interface TrackingService {

    void addTrackingEvent(String shipmentId,
                          String trackingNumber,
                          ShipmentStatus status,
                          String hubId,
                          String location,
                          String remarks);

    List<TrackingEvent> getTrackingHistory(String trackingNumber);
}
