package com.shipfast.shipment.service.impl;

import com.shipfast.shipment.dto.CreateShipmentRequest;
import com.shipfast.shipment.entity.PriceBreakdown;
import com.shipfast.shipment.entity.Shipment;
import com.shipfast.shipment.entity.enums.PaymentStatus;
import com.shipfast.shipment.entity.enums.ShipmentStatus;
import com.shipfast.shipment.repository.ShipmentRepository;
import com.shipfast.shipment.service.ShipmentService;
import com.shipfast.shipment.service.TrackingService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final TrackingService trackingService;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository,
                               TrackingService trackingService) {
        this.shipmentRepository = shipmentRepository;
        this.trackingService = trackingService;
    }

    @Override
    public Shipment createShipment(CreateShipmentRequest request) {

        Shipment shipment = new Shipment();
        shipment.setShipmentId(UUID.randomUUID().toString());
        shipment.setTrackingNumber("TRK" + System.currentTimeMillis());
        shipment.setCustomerId(request.getCustomerId());
        shipment.setStatus(ShipmentStatus.BOOKED);
        shipment.setServiceType(request.getServiceType());
        shipment.setZoneType(request.getZoneType());
        shipment.setSenderAddress(request.getSenderAddress());
        shipment.setReceiverAddress(request.getReceiverAddress());
        shipment.setPackageDetails(request.getPackageDetails());
        shipment.setBookingDate(LocalDateTime.now());
        shipment.setPaymentStatus(PaymentStatus.PENDING);

        PriceBreakdown price = new PriceBreakdown();
        price.setBaseRate(100);
        price.setTax(10);
        price.setFuelSurcharge(15);
        price.setTotalAmount(125);
        shipment.setPriceBreakdown(price);

        Shipment saved = shipmentRepository.save(shipment);

        // 🔥 Create initial tracking event
        trackingService.addTrackingEvent(
                saved.getShipmentId(),
                saved.getTrackingNumber(),
                ShipmentStatus.BOOKED,
                "ORIGIN_HUB",
                saved.getSenderAddress().getCity(),
                "Shipment booked successfully"
        );

        return saved;
    }

    @Override
    public Shipment getByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
    }

    @Override
    public List<Shipment> getByCustomerId(Long customerId) {
        return shipmentRepository.findByCustomerId(customerId);
    }

    @Override
    public Shipment updateStatus(String trackingNumber, ShipmentStatus status) {

        Shipment shipment = getByTrackingNumber(trackingNumber);

        shipment.setStatus(status);

        if (status == ShipmentStatus.DELIVERED) {
            shipment.setActualDeliveryDate(LocalDateTime.now());
            shipment.setPaymentStatus(PaymentStatus.PAID);
        }

        Shipment updated = shipmentRepository.save(shipment);

        // 🔥 Add tracking event on every status change
        trackingService.addTrackingEvent(
                updated.getShipmentId(),
                updated.getTrackingNumber(),
                status,
                "UPDATED_HUB",
                updated.getReceiverAddress().getCity(),
                "Status updated to " + status.name()
        );

        return updated;
    }
}
