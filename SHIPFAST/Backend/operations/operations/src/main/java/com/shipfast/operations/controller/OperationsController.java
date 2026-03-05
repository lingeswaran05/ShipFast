package com.shipfast.operations.controller;

import com.shipfast.operations.dto.*;
import com.shipfast.operations.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor

public class OperationsController {

    private final OperationsService service;


    @PostMapping("/agents")
    public AgentResponse createAgent(@RequestBody AgentRequest request) {
        return service.createAgent(request);
    }

    @GetMapping("/agents")
    public List<AgentResponse> getAgents() {
        return service.getAllAgents();
    }

    @GetMapping("/agents/profile/{userId}")
    public AgentProfileResponse getAgentProfile(@PathVariable String userId) {
        return service.getAgentProfileByUserId(userId);
    }

    @PutMapping("/agents/profile/{userId}")
    public AgentProfileResponse upsertAgentProfile(@PathVariable String userId,
                                                   @RequestBody AgentProfileRequest request) {
        return service.upsertAgentProfile(userId, request);
    }

    @PutMapping("/agents/profile/{userId}/verify")
    public AgentProfileResponse verifyAgentProfile(@PathVariable String userId,
                                                   @RequestBody AgentVerificationRequest request) {
        return service.verifyAgentProfile(userId, request);
    }

    @DeleteMapping("/agents/profile/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAgentProfile(@PathVariable String userId) {
        service.deleteAgentProfile(userId);
    }

    @PostMapping("/agents/{agentIdentifier}/rating")
    public AgentProfileResponse updateAgentRating(@PathVariable String agentIdentifier,
                                                  @RequestBody AgentRatingRequest request) {
        return service.recordAgentRating(agentIdentifier, request);
    }



    @PostMapping("/runsheet")
    public RunSheetResponse createRunSheet(@RequestBody RunSheetRequest request) {
        return service.createRunSheet(request);
    }

    @GetMapping("/runsheet/{agentId}")
    public List<RunSheetResponse> getRunSheet(@PathVariable String agentId) {
        return service.getRunSheetsByAgent(agentId);
    }


    @PostMapping("/scan")
    public void scan(@RequestBody ScanRequest request) {
        service.scanShipment(request);
    }


    @PostMapping("/cash")
    public CashCollectionResponse recordCash(@RequestBody CashCollectionRequest request) {
        return service.recordCash(request);
    }

    @PutMapping("/cash/{id}/verify")
    public CashCollectionResponse verify(@PathVariable String id) {
        return service.verifyCash(id);
    }

    @PostMapping("/invoice")
    public InvoiceResponse generateInvoice(@RequestBody InvoiceRequest request) {
        return service.generateInvoice(request);
    }
}
