package com.shipfast.shipment.entity;

import com.shipfast.shipment.entity.enums.ShipmentStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tracking_events")
public class TrackingEvent {

    @Id
    private String eventId;

    private String shipmentId;
    private String trackingNumber;
    private ShipmentStatus status;
    private String hubId;
    private String location;
    private LocalDateTime timestamp;
    private String remarks;
}
