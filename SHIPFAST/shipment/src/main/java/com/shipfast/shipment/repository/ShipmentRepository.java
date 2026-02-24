package com.shipfast.shipment.repository;

import com.shipfast.shipment.entity.Shipment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends MongoRepository<Shipment, String> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    List<Shipment> findByCustomerId(Long customerId);
}
