package com.shipfast.shipment.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;
import org.springframework.web.server.ResponseStatusException;

import com.shipfast.shipment.dto.AssignShipmentRequest;
import com.shipfast.shipment.dto.CalculateRateRequest;
import com.shipfast.shipment.dto.CreateShipmentRequest;
import com.shipfast.shipment.dto.RateCalculationResponse;
import com.shipfast.shipment.dto.RatingRequest;
import com.shipfast.shipment.dto.ShipmentListResponse;
import com.shipfast.shipment.dto.UpdateShipmentRequest;
import com.shipfast.shipment.dto.UpdateStatusRequest;
import com.shipfast.shipment.entity.Shipment;
import com.shipfast.shipment.entity.TrackingEvent;
import com.shipfast.shipment.repository.ShipmentRepository;
import com.shipfast.shipment.service.ShipmentService;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${operations.service.url:http://localhost:8082}")
    private String operationsServiceUrl;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }

    @Override
    public Shipment createShipment(CreateShipmentRequest request) {
        validateCreateRequest(request);

        LocalDateTime now = LocalDateTime.now();
        String shipmentId = "SHP" + Math.abs(UUID.randomUUID().toString().hashCode()) + System.currentTimeMillis() % 1000;
        String trackingNumber = "SF" + System.currentTimeMillis();

        RateCalculationResponse rate = calculateRateFromInputs(
                request.getPackageDetails().getWeight(),
                request.getServiceType(),
                extractPincode(request.getSender().getAddress()),
                extractPincode(request.getRecipient().getAddress())
        );

        TrackingEvent initialEvent = TrackingEvent.builder()
                .status("Booked")
                .location("Origin Hub")
                .timestamp(now)
                .remarks("Shipment created.")
                .build();

        Shipment shipment = Shipment.builder()
                .id(shipmentId)
                .trackingNumber(trackingNumber)
            .customerId(request.getCustomerId())
            .branchId(request.getBranchId())
                .status("Booked")
                .serviceType(request.getServiceType())
                .paymentMethod(request.getPaymentMethod())
                .cost(rate.getTotalCost())
                .createdAt(now)
                .estimatedDelivery(now.plusDays(rate.getEstimatedDeliveryDays()))
                .updatedAt(now)
                .sender(request.getSender())
                .recipient(request.getRecipient())
                .packageDetails(request.getPackageDetails())
                .history(new ArrayList<>(List.of(initialEvent)))
                .build();

        return shipmentRepository.save(shipment);
    }

    @Override
    public ShipmentListResponse getAll(String status,
                                       String branchId,
                                       LocalDate dateFrom,
                                       LocalDate dateTo,
                                       Integer page,
                                       Integer limit) {
        int pageNumber = page == null || page < 1 ? 0 : page - 1;
        int pageSize = limit == null || limit < 1 ? 10 : limit;

        List<Shipment> filtered = shipmentRepository.findAll().stream()
                .filter(item -> !hasText(status) || (item.getStatus() != null && item.getStatus().equalsIgnoreCase(status)))
                .filter(item -> !hasText(branchId) || (item.getBranchId() != null && item.getBranchId().equalsIgnoreCase(branchId)))
                .filter(item -> {
                    if (dateFrom == null && dateTo == null) {
                        return true;
                    }
                    if (item.getCreatedAt() == null) {
                        return false;
                    }
                    LocalDateTime from = dateFrom == null ? LocalDate.MIN.atStartOfDay() : dateFrom.atStartOfDay();
                    LocalDateTime to = dateTo == null ? LocalDate.MAX.atTime(LocalTime.MAX) : dateTo.atTime(LocalTime.MAX);
                    return !item.getCreatedAt().isBefore(from) && !item.getCreatedAt().isAfter(to);
                })
                .sorted(Comparator.comparing(Shipment::getCreatedAt,
                    Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());

        int fromIndex = Math.min(pageNumber * pageSize, filtered.size());
        int toIndex = Math.min(fromIndex + pageSize, filtered.size());
        List<Shipment> pagedData = filtered.subList(fromIndex, toIndex);
        int totalPages = filtered.isEmpty() ? 0 : (int) Math.ceil((double) filtered.size() / pageSize);

        return ShipmentListResponse.builder()
                .data(pagedData)
                .pagination(ShipmentListResponse.Pagination.builder()
                        .totalItems(filtered.size())
                        .totalPages(totalPages)
                        .currentPage(pageNumber + 1)
                        .build())
                .build();
    }

    @Override
    public List<Shipment> getMine(String customerId) {
        if (!hasText(customerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "customerId is required");
        }
        return shipmentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Override
    public Shipment getByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));
    }

    @Override
    public Shipment getById(String shipmentId) {
        if (!hasText(shipmentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "shipmentId is required");
        }

        return shipmentRepository.findById(shipmentId)
                .or(() -> shipmentRepository.findByTrackingNumber(shipmentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));
    }

    @Override
    public Shipment updateShipment(String shipmentId, UpdateShipmentRequest request) {
        Shipment shipment = getById(shipmentId);

        if (request.getSender() != null) {
            shipment.setSender(request.getSender());
        }
        if (request.getRecipient() != null) {
            shipment.setRecipient(request.getRecipient());
        }
        if (request.getPackageDetails() != null) {
            shipment.setPackageDetails(request.getPackageDetails());
        }
        if (hasText(request.getServiceType())) {
            shipment.setServiceType(request.getServiceType());
        }
        if (hasText(request.getPaymentMethod())) {
            shipment.setPaymentMethod(request.getPaymentMethod());
        }

        shipment.setUpdatedAt(LocalDateTime.now());
        return shipmentRepository.save(shipment);
    }

    @Override
    public void deleteShipment(String shipmentId) {
        if (!shipmentRepository.existsById(shipmentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found");
        }
        shipmentRepository.deleteById(shipmentId);
    }

    @Override
    public Shipment updateStatus(String shipmentId, UpdateStatusRequest request, String customerId) {
        Shipment shipment = getById(shipmentId);
        String nextStatus = normalizeStatus(request.getStatus());
        if (!hasText(nextStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        if ("Cancelled".equalsIgnoreCase(nextStatus) && hasText(customerId) && !customerId.equals(shipment.getCustomerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can cancel only your own shipment");
        }

        shipment.setStatus(nextStatus);
        shipment.setUpdatedAt(LocalDateTime.now());
        if ("Delivered".equalsIgnoreCase(nextStatus)) {
            shipment.setDeliveredAt(LocalDateTime.now());
            if (hasText(request.getProofOfDeliveryImage())) {
                shipment.setProofOfDeliveryImage(request.getProofOfDeliveryImage());
            }
            if (hasText(request.getDeliveredBy())) {
                shipment.setDeliveredBy(request.getDeliveredBy());
            }
            if (hasText(request.getDeliveredByAgentId())) {
                shipment.setDeliveredByAgentId(request.getDeliveredByAgentId());
            } else if (hasText(shipment.getAssignedAgentId())) {
                shipment.setDeliveredByAgentId(shipment.getAssignedAgentId());
            } else if (hasText(customerId) && !customerId.equalsIgnoreCase(shipment.getCustomerId())) {
                shipment.setDeliveredByAgentId(customerId);
            }
            if (!hasText(shipment.getAssignedAgentId()) && hasText(shipment.getDeliveredByAgentId())) {
                shipment.setAssignedAgentId(shipment.getDeliveredByAgentId());
            }
        }

        TrackingEvent event = TrackingEvent.builder()
                .status(nextStatus)
                .location(hasText(request.getLocation()) ? request.getLocation() : "Hub Update")
                .timestamp(LocalDateTime.now())
                .remarks(hasText(request.getRemarks()) ? request.getRemarks() : "Status updated")
                .build();

        if (shipment.getHistory() == null) {
            shipment.setHistory(new ArrayList<>());
        }
        shipment.getHistory().add(event);

        return shipmentRepository.save(shipment);
    }

    @Override
    public Shipment assignShipment(String shipmentId, AssignShipmentRequest request) {
        Shipment shipment = getById(shipmentId);
        if (!hasText(request.getAgentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "agentId is required");
        }
        shipment.setAssignedAgentId(request.getAgentId());
        shipment.setUpdatedAt(LocalDateTime.now());
        return shipmentRepository.save(shipment);
    }

    @Override
    public Shipment addRating(String shipmentId, RatingRequest request) {
        Shipment shipment = getById(shipmentId);
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rating must be between 1 and 5");
        }
        shipment.setRating(request.getRating());
        shipment.setRatingComment(request.getComment());
        shipment.setUpdatedAt(LocalDateTime.now());
        Shipment savedShipment = shipmentRepository.save(shipment);

        String agentIdentifier = hasText(savedShipment.getDeliveredByAgentId())
                ? savedShipment.getDeliveredByAgentId()
                : savedShipment.getAssignedAgentId();
        if (hasText(agentIdentifier)) {
            try {
                restTemplate.postForObject(
                        operationsServiceUrl + "/api/operations/agents/" + UriUtils.encodePathSegment(agentIdentifier, java.nio.charset.StandardCharsets.UTF_8) + "/rating",
                        Map.of("rating", request.getRating()),
                        Object.class
                );
            } catch (Exception ignored) {
                // keep shipment rating successful even if agent profile sync is temporarily unavailable
            }
        }

        return savedShipment;
    }

    @Override
    public RateCalculationResponse calculateRate(CalculateRateRequest request) {
        if (request.getWeight() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weight must be greater than 0");
        }
        return calculateRateFromInputs(
                request.getWeight(),
                request.getServiceType(),
                request.getOriginPincode(),
                request.getDestinationPincode());
    }

    private RateCalculationResponse calculateRateFromInputs(double weight,
                                                            String serviceType,
                                                            String originPincode,
                                                            String destinationPincode) {
        double baseRate = weight * 80;
        if (hasText(serviceType) && "Express".equalsIgnoreCase(serviceType)) {
            baseRate += 60;
        }

        if (hasText(originPincode) && hasText(destinationPincode)) {
            if (!originPincode.substring(0, Math.min(2, originPincode.length()))
                    .equals(destinationPincode.substring(0, Math.min(2, destinationPincode.length())))) {
                baseRate += 40;
            }
        }

        double fuelSurcharge = Math.round(baseRate * 0.09 * 100.0) / 100.0;
        double gst = Math.round(baseRate * 0.05 * 100.0) / 100.0;
        double total = Math.round((baseRate + fuelSurcharge + gst) * 100.0) / 100.0;

        int etaDays = hasText(serviceType) && "Express".equalsIgnoreCase(serviceType) ? 2 : 4;

        return RateCalculationResponse.builder()
                .baseRate(Math.round(baseRate * 100.0) / 100.0)
                .fuelSurcharge(fuelSurcharge)
                .gst(gst)
                .totalCost(total)
                .estimatedDeliveryDays(etaDays)
                .build();
    }

    private void validateCreateRequest(CreateShipmentRequest request) {
        if (request == null || request.getSender() == null || request.getRecipient() == null || request.getPackageDetails() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sender, recipient and packageDetails are required");
        }
        if (request.getPackageDetails().getWeight() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "packageDetails.weight must be greater than 0");
        }
    }

    private String extractPincode(String address) {
        if (!hasText(address)) {
            return null;
        }
        String[] parts = address.split(",");
        return parts[parts.length - 1].trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String normalizeStatus(String status) {
        if (!hasText(status)) return status;
        String sanitized = status.replace('_', ' ').trim().toLowerCase();
        String[] words = sanitized.split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (words[i].isEmpty()) continue;
            builder.append(Character.toUpperCase(words[i].charAt(0)))
                    .append(words[i].substring(1));
            if (i < words.length - 1) builder.append(" ");
        }
        return builder.toString();
    }
}
