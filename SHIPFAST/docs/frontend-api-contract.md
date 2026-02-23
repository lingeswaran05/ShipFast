# ShipFast Frontend API Contract (Updated)

This document defines the exact API contracts required by the updated frontend implementation.

## 1) Environment Variables

Set these in frontend `.env` for smooth integration:

- `VITE_AUTH_BASE_URL` (default: `/api/v1/auth`)
- `VITE_ADMIN_BASE_URL` (default: `/api/admin`)
- `VITE_COMM_BASE_URL` (default: `` empty, so frontend calls `/api/notifications` and `/api/support`)

## 2) Common Response Format (Recommended)

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Frontend supports either wrapped (`data`) or raw payload responses.

---

## 3) Authentication Service
Base: `http://localhost:8085/api/v1/auth`

### POST `/login`
Request:
```json
{
  "email": "lee.customer@gmail.com",
  "password": "ShipFast@123"
}
```
Response (`data`):
```json
{
  "accessToken": "jwt-access",
  "refreshToken": "jwt-refresh",
  "user": {
    "userId": "USER2309348",
    "fullName": "Lingeswaran A",
    "email": "lee.customer@gmail.com",
    "phoneNumber": "9876543210",
    "address": "12 Main Street",
    "city": "Thanjavur",
    "state": "Tamil Nadu",
    "pincode": "613001",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

### POST `/register`
Request:
```json
{
  "fullName": "Lingeswaran A",
  "email": "lee.customer@gmail.com",
  "password": "ShipFast@123",
  "phoneNumber": "9876543210",
  "address": "12 Main Street",
  "city": "Thanjavur",
  "state": "Tamil Nadu",
  "pincode": "613001",
  "role": "CUSTOMER"
}
```

### GET `/profile` (Bearer)
Response (`data`): same user object fields as login response.

### PUT `/profile` (Bearer)
Request:
```json
{
  "fullName": "Lingeswaran Updated",
  "phoneNumber": "9876543210",
  "address": "45 New Street",
  "city": "Thanjavur",
  "state": "Tamil Nadu",
  "pincode": "613002"
}
```
Response (`data`): updated user object.

### PUT `/change-password` (Bearer)
```json
{
  "oldPassword": "ShipFast@123",
  "newPassword": "ShipFast@456"
}
```

### POST `/refresh-token`
```json
{
  "refreshToken": "jwt-refresh"
}
```

### POST `/logout`
```json
{
  "refreshToken": "jwt-refresh"
}
```

### POST `/forgot-password`
```json
{
  "email": "lee.customer@gmail.com"
}
```

### POST `/verify-otp`
```json
{
  "email": "lee.customer@gmail.com",
  "otp": "123456"
}
```

### POST `/reset-password`
```json
{
  "email": "lee.customer@gmail.com",
  "newPassword": "ShipFast@789"
}
```

---

## 4) Auth Admin User Management (RBAC persistence)
Base: `http://localhost:8085/api/v1/auth`

### GET `/admin/users` (Bearer ADMIN)
Response (`data`):
```json
[
  {
    "userId": "USER2309348",
    "fullName": "Kiran",
    "email": "kiran@mail.com",
    "phoneNumber": "9999999999",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
]
```

### PUT `/admin/users/{userId}/role` (Bearer ADMIN)
Request:
```json
{
  "role": "AGENT"
}
```
Accepted values recommended: `CUSTOMER`, `AGENT`, `DRIVER`, `MANAGER`, `ADMIN`.

### DELETE `/admin/users/{userId}` (Bearer ADMIN)
Purpose: deactivate/revoke access.

---

## 5) Admin Service
Base: `http://localhost:{admin-port}/api/admin`

### Branches

#### POST `/branches`
Request:
```json
{
  "name": "Thanjavur Branch",
  "location": "Thanjavur",
  "managerName": "Arun"
}
```
Response (`data`) minimal required:
```json
{
  "id": "BR001",
  "name": "Thanjavur Branch",
  "location": "Thanjavur",
  "managerName": "Arun",
  "type": "Branch",
  "status": "Active"
}
```

#### GET `/branches`
Response (`data`): array of branch objects.

#### PUT `/branches/{branchId}`
Request:
```json
{
  "name": "Thanjavur Branch",
  "location": "Thanjavur",
  "managerName": "Arun"
}
```

#### DELETE `/branches/{branchId}`

### Vehicles

#### POST `/vehicles`
Request:
```json
{
  "vehicleNumber": "TN09AB1234",
  "type": "TRUCK",
  "capacity": 2000
}
```
Response (`data`) minimal:
```json
{
  "id": "VH001",
  "vehicleNumber": "TN09AB1234",
  "type": "TRUCK",
  "capacity": 2000,
  "status": "Available"
}
```

#### GET `/vehicles`
Response (`data`): array of vehicle objects.

#### PUT `/vehicles/{vehicleId}`
Request:
```json
{
  "vehicleNumber": "TN09AB1234",
  "type": "TRUCK",
  "capacity": 2500
}
```

---

## 6) Communication Service
Base notifications: `http://localhost:{comm-port}/api/notifications`
Base support: `http://localhost:{comm-port}/api/support`

### Notifications

#### POST `/api/notifications/send`
Query params (no JSON body):
- `userId`
- `type` (example `EMAIL`)
- `message`

Example:
`/api/notifications/send?userId=USER2309348&type=EMAIL&message=Shipment%20Delivered`

#### GET `/api/notifications/{userId}`
Response (`data`) array:
```json
[
  {
    "id": "N001",
    "userId": "USER2309348",
    "type": "EMAIL",
    "message": "Shipment Delivered",
    "isRead": false,
    "createdAt": "2026-02-21T10:30:00Z"
  }
]
```

### Support

#### POST `/api/support/create`
Request:
```json
{
  "userId": "USER2309348",
  "subject": "Shipment Delay",
  "description": "My shipment is late",
  "priority": "MEDIUM",
  "category": "Shipment Issue"
}
```

#### GET `/api/support/user/{userId}`
Response (`data`) array:
```json
[
  {
    "id": "TKT-1001",
    "userId": "USER2309348",
    "subject": "Shipment Delay",
    "description": "My shipment is late",
    "priority": "MEDIUM",
    "status": "OPEN",
    "createdAt": "2026-02-21T10:30:00Z",
    "updatedAt": "2026-02-21T11:00:00Z"
  }
]
```

#### PUT `/api/support/close/{ticketId}`
Response (`data`): updated ticket with `status: "CLOSED"`.

---

## 7) Frontend Behavior Notes (Updated)

1. Login/Register/Profile are DB-backed via auth service.
2. Admin branch and vehicle create/update/delete now call Admin service.
3. Support ticket create/list/close now call Communication service.
4. Notifications are polled by frontend every 20s for current user.
5. Role request/approval UI exists; approval writes role through auth admin role endpoint.
6. Agent onboarding docs (Aadhaar/License/RC) are intentionally stored in browser storage as requested.

---

## 8) Required CORS

Allow frontend origin(s), for example:
- `http://localhost:5173`
- `http://localhost:5175`

Allow methods:
- `GET, POST, PUT, DELETE, OPTIONS`

Allow headers:
- `Authorization, Content-Type`
