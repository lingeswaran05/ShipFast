# Shipment Service API Contract

This document outlines the API endpoints, request methods, and data structures required by the frontend to manage shipments.

**Base URL**: `/api/v1/shipments`

---

## 1. Core Shipment CRUD Operations

### 1.1 Create Shipment

- **Endpoint**: `POST /`
- **Usage**: Used by customers in the `BookingForm` to create a new shipment.
- **Authentication**: Customer, Agent, Admin
- **Sample Request Body**:
  ```json
  {
    "sender": {
      "name": "John Doe",
      "address": "123 Sender St, City A, State, 110011",
      "phone": "9876543210"
    },
    "recipient": {
      "name": "Jane Smith",
      "address": "456 Recipient Ave, City B, State, 220022",
      "phone": "8765432109"
    },
    "packageDetails": {
      "weight": 2.5,
      "dimensions": "10x15x20",
      "type": "Electronics",
      "description": "A box of electronic goods."
    },
    "serviceType": "Express",
    "paymentMethod": "Prepaid"
  }
  ```
- **Sample Response (201)**:
  ```json
  {
    "id": "SHP123456789",
    "trackingNumber": "SF123456789",
    "status": "Pending",
    "createdAt": "2026-02-21T10:00:00Z",
    "estimatedDelivery": "2026-02-24T18:00:00Z",
    "cost": 250.00,
    "sender": { "...": "..." },
    "recipient": { "...": "..." },
    "packageDetails": { "...": "..." },
    "history": [
      {
        "status": "Pending",
        "location": "City A Hub",
        "timestamp": "2026-02-21T10:00:00Z",
        "remarks": "Shipment created."
      }
    ]
  }
  ```

### 1.2 Get All Shipments (Filtered)

- **Endpoint**: `GET /`
- **Usage**: Used by admins to view all shipments and by agents to view shipments related to their branch. Customers use a user-specific endpoint.
- **Authentication**: Agent, Admin
- **Query Parameters**:
  - `status` (e.g., `Pending`, `In Transit`)
  - `branchId` (e.g., `BRN001`)
  - `dateFrom`, `dateTo` (e.g., `2026-01-01`)
  - `page`, `limit`
- **Sample Response (200)**:
  ```json
  {
    "data": [
      {
        "id": "SHP123456789",
        "trackingNumber": "SF123456789",
        "status": "In Transit",
        "cost": 250.00,
        "sender": { "name": "John Doe" },
        "recipient": { "name": "Jane Smith" },
        "createdAt": "2026-02-21T10:00:00Z"
      }
    ],
    "pagination": {
      "totalItems": 100,
      "totalPages": 10,
      "currentPage": 1
    }
  }
  ```

### 1.3 Get Shipments for Current User

- **Endpoint**: `GET /mine`
- **Usage**: Used in `MyShipments.jsx` for customers to see their own created shipments.
- **Authentication**: Customer
- **Sample Response (200)**:
  ```json
  [
    {
      "id": "SHP123456789",
      "trackingNumber": "SF123456789",
      "status": "Delivered",
      "recipient": { "name": "Jane Smith" },
      "estimatedDelivery": "2026-02-24T18:00:00Z",
      "cost": 250.00
    }
  ]
  ```

### 1.4 Get Shipment by Tracking Number (Public)

- **Endpoint**: `GET /track/:trackingNumber`
- **Usage**: Used in the public `TrackingPortal.jsx`.
- **Authentication**: None
- **Sample Response (200)**:
  ```json
  {
    "trackingNumber": "SF123456789",
    "status": "Out for Delivery",
    "estimatedDelivery": "2026-02-24T18:00:00Z",
    "history": [
      { "status": "Out for Delivery", "location": "City B Hub", "timestamp": "2026-02-24T09:00:00Z" },
      { "status": "In Transit", "location": "City B Hub", "timestamp": "2026-02-23T15:00:00Z" },
      { "status": "Pending", "location": "City A Hub", "timestamp": "2026-02-21T10:00:00Z" }
    ]
  }
  ```

### 1.5 Get Shipment Details by ID (Private)

- **Endpoint**: `GET /:shipmentId`
- **Usage**: Used to get full details for invoices, editing, or viewing by authorized users.
- **Authentication**: Customer (own shipment), Agent, Admin
- **Sample Response (200)**: (Full shipment object as in 1.1)

### 1.6 Update Shipment Details

- **Endpoint**: `PUT /:shipmentId`
- **Usage**: Used by admins or agents to correct shipment details (e.g., address).
- **Authentication**: Agent, Admin
- **Sample Request Body**:
  ```json
  {
    "recipient": {
      "name": "Jane Smith",
      "address": "789 Recipient Blvd, City B, State, 220022",
      "phone": "8765432109"
    }
  }
  ```
- **Sample Response (200)**: (Full updated shipment object)

### 1.7 Delete Shipment

- **Endpoint**: `DELETE /:shipmentId`
- **Usage**: Used by admins for exceptional cases to remove a shipment record.
- **Authentication**: Admin
- **Sample Response (204)**: No Content

---

## 2. Shipment Status & Workflow

### 2.1 Update Shipment Status

- **Endpoint**: `PATCH /:shipmentId/status`
- **Usage**: The primary endpoint for agents to update the shipment's journey. Also used by customers to cancel.
- **Authentication**: Customer (only for 'Cancelled'), Agent, Admin
- **Sample Request Body**:
  ```json
  {
    "status": "Out for Delivery",
    "location": "City B Local Hub",
    "remarks": "On its way to the recipient."
  }
  ```
- **Sample Response (200)**:
  ```json
  {
    "id": "SHP123456789",
    "status": "Out for Delivery",
    "history": [
      { "status": "Out for Delivery", "location": "City B Local Hub", "timestamp": "2026-02-24T09:00:00Z", "remarks": "On its way to the recipient." },
      { "...": "..." }
    ]
  }
  ```

### 2.2 Assign Shipment to Agent/Driver

- **Endpoint**: `PATCH /:shipmentId/assign`
- **Usage**: Used by branch managers (Agents) to assign a last-mile delivery to a specific driver.
- **Authentication**: Agent (Manager role), Admin
- **Sample Request Body**:
  ```json
  {
    "agentId": "AGENT123"
  }
  ```
- **Sample Response (200)**:
  ```json
  {
    "id": "SHP123456789",
    "status": "In Transit",
    "assignedAgentId": "AGENT123"
  }
  ```

---

## 3. Additional Services

### 3.1 Rate a Shipment

- **Endpoint**: `POST /:shipmentId/rating`
- **Usage**: Used by customers in `RateShipmentModal.jsx` after a shipment is delivered.
- **Authentication**: Customer (own shipment)
- **Sample Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Excellent service! Very fast delivery."
  }
  ```
- **Sample Response (200)**:
  ```json
  {
    "id": "SHP123456789",
    "rating": 5,
    "ratingComment": "Excellent service! Very fast delivery."
  }
  ```

### 3.2 Get Pricing/Rate Calculation

- **Endpoint**: `POST /calculate-rate`
- **Usage**: Used in `BookingForm.jsx` to provide a real-time cost estimate before booking.
- **Authentication**: Customer, Agent, Admin
- **Sample Request Body**:
  ```json
  {
    "weight": 2.5,
    "serviceType": "Express",
    "originPincode": "110011",
    "destinationPincode": "220022"
  }
  ```
- **Sample Response (200)**:
  ```json
  {
    "baseRate": 220.00,
    "fuelSurcharge": 20.00,
    "gst": 10.00,
    "totalCost": 250.00,
    "estimatedDeliveryDays": 3
  }
  ```

---

## 4. Analytics

### 4.1 Get Shipment Analytics

- **Endpoint**: `GET /analytics`
- **Usage**: Used by the `AdminDashboard` to populate charts and summary cards.
- **Authentication**: Admin
- **Query Parameters**:
  - `period` (e.g., `weekly`, `monthly`, `yearly`)
  - `branchId` (optional)
- **Sample Response (200)**:
  ```json
  {
    "summary": {
      "totalShipments": 5820,
      "totalRevenue": 1455000,
      "activeShipments": 350,
      "deliveredToday": 85
    },
    "revenueOverTime": [
      { "date": "2026-02-15", "revenue": 50000 },
      { "date": "2026-02-16", "revenue": 52300 },
      { "...": "..." }
    ],
    "volumeOverTime": [
      { "date": "2026-02-15", "volume": 210 },
      { "date": "2026-02-16", "volume": 225 },
      { "...": "..." }
    ],
    "statusDistribution": {
      "Delivered": 4500,
      "In Transit": 800,
      "Pending": 300,
      "Cancelled": 220
    }
  }
  ```
