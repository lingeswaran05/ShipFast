# SHIPFAST System Overview

This document provides a comprehensive overview of the SHIPFAST courier management system, following a Frontend -> API -> Backend structure.

## 1. System Architecture

SHIPFAST is built on a **microservices architecture**. This design promotes scalability, resilience, and maintainability by decoupling different parts of the system.

The key components are:

*   **Frontend:** A React-based single-page application (SPA) that serves as the user interface for all user roles.
*   **API Gateway:** An implied component that routes frontend requests to the appropriate backend microservice. Prefixes like `/api/v1/` and `/api/admin/` indicate its presence.
*   **Backend Microservices:** A collection of independent services, each handling a specific business domain (Authentication, Shipments, etc.).

---

## 2. Frontend

The frontend is a modern single-page application that provides the user interface for customers, agents, and administrators.

*   **Framework:** **React** (v18.2.0), confirmed by `package.json`. This includes `react-router-dom` for navigation.
*   **Key Features:**
    *   **User Dashboards:** Separate, tailored dashboards for `CUSTOMER`, `AGENT`, and `ADMIN` roles.
    *   **Shipment Management:** Forms for booking shipments and a portal for public tracking. Customers can view their shipment history.
    *   **Admin Panels:** Interfaces for managing branches and vehicles.
    *   **Support System:** UI for creating and viewing support tickets.
    *   **Real-time Updates:** The frontend polls every 20 seconds to fetch the latest notifications for the logged-in user.

---

## 3. API Contracts & Endpoints

The frontend communicates with the backend via a set of RESTful APIs.

### Authentication & Security

*   **Strategy:** The system uses **JSON Web Tokens (JWT)** for securing endpoints.
    *   `accessToken`: A short-lived token for accessing protected resources.
    *   `refreshToken`: A long-lived token to get a new `accessToken`.
*   **Authorization:** **Role-Based Access Control (RBAC)** is used to restrict API access based on user roles (`CUSTOMER`, `AGENT`, `ADMIN`, etc.).
*   **Endpoints (Base: `/api/v1/auth`)**
    *   `POST /login`: Authenticates a user and returns tokens.
    *   `POST /register`: Creates a new user account.
    *   `GET /profile`: Retrieves the current user's profile.
    *   `PUT /profile`: Updates the current user's profile.
    *   `PUT /change-password`: Changes the user's password.
    *   `POST /refresh-token`: Obtains a new access token.
    *   `GET /admin/users`: (Admin) Retrieves a list of all users.
    *   `PUT /admin/users/{userId}/role`: (Admin) Updates a user's role.

### Shipment Service API

*   **Endpoints (Base: `/api/v1/shipments`)**
    *   `POST /`: Creates a new shipment.
    *   `GET /mine`: Gets all shipments for the current logged-in customer.
    *   `GET /track/:trackingNumber`: Publicly tracks a shipment's history.
    *   `GET /:shipmentId`: Gets full details for a specific shipment.
    *   `PATCH /:shipmentId/status`: Updates the status of a shipment (e.g., "In Transit").
    *   `POST /calculate-rate`: Calculates the estimated cost of a shipment.
    *   `GET /analytics`: (Admin) Provides summary data for the dashboard.

### Admin Service API

*   **Endpoints (Base: `/api/admin`)**
    *   `POST /branches`, `GET /branches`, `PUT /branches/{branchId}`: Manages branches.
    *   `POST /vehicles`, `GET /vehicles`, `PUT /vehicles/{vehicleId}`: Manages vehicles.

### Communication Service API

*   **Endpoints (Base: `/api`)**
    *   `POST /notifications/send`: Sends a notification to a user.
    *   `GET /notifications/{userId}`: Retrieves notifications for a user.
    *   `POST /support/create`: Creates a new support ticket.
    *   `GET /support/user/{userId}`: Gets all support tickets for a user.

---

## 4. Backend

The backend consists of several microservices, each with a distinct responsibility.

### 4.1. Authentication Service
*   **Responsibilities:** Manages all aspects of user identity, including registration, login, profile updates, password changes, and token management. It is the central authority for user roles and permissions (RBAC).

### 4.2. Admin Service
*   **Responsibilities:** Handles administrative functions that are not directly related to shipments, such as creating and managing company branches and the vehicle fleet.

### 4.3. Shipment Service
*   **Responsibilities:** This is the core service of the application. It manages the entire lifecycle of a shipment, from creation and rate calculation to status updates, tracking, and analytics.

### 4.4. Communication Service
*   **Responsibilities:** Manages all user-facing communication. This includes sending notifications (like email alerts for shipment status changes) and handling the customer support ticketing system.

---

## 5. High-Level Data Flow Example (Booking a Shipment)

1.  **Login:** A `CUSTOMER` logs in via the **Frontend**. The request hits the **Authentication Service API**, which validates credentials and returns JWTs.
2.  **Calculate Rate:** The user fills out the booking form. The **Frontend** sends a request to the **Shipment Service API** (`/calculate-rate`) to get a price estimate.
3.  **Create Shipment:** The user submits the form. The **Frontend** sends the shipment data to the **Shipment Service API** (`POST /`). The service creates the shipment, stores it in its database, and generates a tracking number.
4.  **Notification:** The **Shipment Service** may trigger the **Communication Service API** (`/notifications/send`) to send a "Shipment Created" email to the customer.
5.  **View Shipment:** The user is redirected to their "My Shipments" page, where the **Frontend** calls the **Shipment Service API** (`/mine`) to display a list of their shipments, including the new one.
