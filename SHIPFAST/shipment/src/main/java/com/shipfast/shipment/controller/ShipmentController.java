package com.shipfast.shipment.controller;

import com.shipfast.shipment.dto.ApiResponse;
import com.shipfast.shipment.dto.CreateShipmentRequest;
import com.shipfast.shipment.entity.Shipment;
import com.shipfast.shipment.entity.enums.ShipmentStatus;
import com.shipfast.shipment.service.ShipmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    public ApiResponse<Shipment> createShipment(@RequestBody CreateShipmentRequest request) {
        return new ApiResponse<>(true, "Shipment created successfully",
                shipmentService.createShipment(request));
    }

    @GetMapping("/{trackingNumber}")
    public ApiResponse<Shipment> getShipment(@PathVariable String trackingNumber) {
        return new ApiResponse<>(true, "Shipment fetched successfully",
                shipmentService.getByTrackingNumber(trackingNumber));
    }

    @GetMapping("/customer/{customerId}")
    public ApiResponse<List<Shipment>> getByCustomer(@PathVariable Long customerId) {
        return new ApiResponse<>(true, "Customer shipments fetched",
                shipmentService.getByCustomerId(customerId));
    }

    @PutMapping("/{trackingNumber}/status")
    public ApiResponse<Shipment> updateStatus(@PathVariable String trackingNumber,
                                              @RequestParam ShipmentStatus status) {
        return new ApiResponse<>(true, "Status updated successfully",
                shipmentService.updateStatus(trackingNumber, status));
    }
}
