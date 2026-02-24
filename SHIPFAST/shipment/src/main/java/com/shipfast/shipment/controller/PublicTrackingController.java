package com.shipfast.shipment.controller;

import com.shipfast.shipment.dto.ApiResponse;
import com.shipfast.shipment.entity.TrackingEvent;
import com.shipfast.shipment.service.TrackingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicTrackingController {

    private final TrackingService trackingService;

    public PublicTrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/track/{trackingNumber}")
    public ApiResponse<List<TrackingEvent>> getTrackingHistory(
            @PathVariable String trackingNumber) {

        return new ApiResponse<>(
                true,
                "Tracking history fetched successfully",
                trackingService.getTrackingHistory(trackingNumber)
        );
    }
}
