import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Transformation Layer ---

const toUIUser = (user) => {
    if (!user) return null;
    return {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(), // UI expects lowercase
        avatar: user.avatarUrl,
        phone: user.contactInfo?.phone || '',
        address: user.contactInfo?.addressLine || '',
        city: user.contactInfo?.city || '',
        state: user.contactInfo?.state || '',
        pincode: user.contactInfo?.pincode || '',
        ...user // Keep other fields if any
    };
};

const toBackendUser = (uiUser) => {
    return {
         userId: uiUser.id,
         name: uiUser.name,
         email: uiUser.email,
         passwordHash: uiUser.password || 'password', // Default if missing
         role: (uiUser.role || 'CUSTOMER').toUpperCase(),
         contactInfo: {
             phone: uiUser.phone,
             addressLine: uiUser.address,
             city: uiUser.city,
             state: uiUser.state,
             pincode: uiUser.pincode
         },
         avatarUrl: uiUser.avatar || `https://i.pravatar.cc/150?u=${uiUser.id}`
    };
};

const formatStatus = (status) => {
    if (!status) return 'Booked';
    // Convert UPPER_CASE to Title Case (e.g., IN_TRANSIT -> In Transit)
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const toUIShipment = (shipment) => {
    if (!shipment) return null;
    return {
        id: shipment.trackingNumber, // UI uses tracking ID as primary ID for display
        trackingId: shipment.trackingNumber,
        userId: shipment.customerId,
        status: formatStatus(shipment.status),
        service: formatStatus(shipment.serviceType), // e.g. "Express" from "EXPRESS"
        date: shipment.dates?.bookingDate,
        deliveryDate: shipment.dates?.estimatedDelivery,
        sender: {
            name: shipment.senderAddress?.fullName,
            phone: shipment.senderAddress?.phone,
            address: shipment.senderAddress?.addressLine,
            city: shipment.senderAddress?.city,
            pincode: shipment.senderAddress?.pincode
        },
        receiver: {
            name: shipment.receiverAddress?.fullName,
            phone: shipment.receiverAddress?.phone,
            address: shipment.receiverAddress?.addressLine,
            city: shipment.receiverAddress?.city,
            pincode: shipment.receiverAddress?.pincode
        },
        weight: `${shipment.packageDetails?.weightKg} kg`,
        cost: shipment.priceBreakdown?.totalAmount,
        type: shipment.packageDetails?.contentType,
        paymentStatus: formatStatus(shipment.paymentStatus),
        transactionId: shipment.transactionId // Pass through if exists
    };
};

const toBackendShipment = (uiShipment) => {
    const trackingId = uiShipment.trackingId || uiShipment.id || `TRK${Date.now()}`;
    return {
        shipmentId: `SH-${Date.now()}`,
        trackingNumber: trackingId,
        customerId: uiShipment.userId || uiShipment.sender?.email || 'unknown', // Fallback
        status: (uiShipment.status || 'BOOKED').toUpperCase().replace(/ /g, '_'),
        serviceType: (uiShipment.service || 'STANDARD').toUpperCase().replace(/ /g, '_'),
        senderAddress: {
            fullName: uiShipment.sender?.name,
            phone: uiShipment.sender?.phone,
            addressLine: uiShipment.sender?.address,
            city: uiShipment.sender?.city,
            pincode: uiShipment.sender?.pincode
        },
        receiverAddress: {
             fullName: uiShipment.receiver?.name,
             phone: uiShipment.receiver?.phone,
             addressLine: uiShipment.receiver?.address,
             city: uiShipment.receiver?.city,
             pincode: uiShipment.receiver?.pincode
        },
        packageDetails: {
            weightKg: parseFloat(uiShipment.weight) || 0,
            contentType: uiShipment.type,
            dimensions: '10x10x10' // Default
        },
        priceBreakdown: {
            baseRate: uiShipment.cost * 0.8, // Approx
            tax: uiShipment.cost * 0.2,
            totalAmount: uiShipment.cost
        },
        dates: {
            bookingDate: new Date().toISOString().split('T')[0],
            estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
        },
        paymentStatus: (uiShipment.paymentStatus || 'PENDING').toUpperCase()
    };
};

// --- Mock Service ---

export const mockService = {
  // --- Auth ---
  login: async (email, password) => {
    try {
      const response = await api.get(`/users?email=${email}&passwordHash=${password}`);
      const users = response.data;
      if (users.length > 0) {
        return toUIUser(users[0]);
      }
      throw new Error('Invalid email or password');
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const existing = await api.get(`/users?email=${userData.email}`);
      if (existing.data.length > 0) {
        throw new Error('Email already exists');
      }
      
      const uiUser = { ...userData, id: `u${Date.now()}`, role: 'customer' };
      const backendUser = toBackendUser(uiUser);
      
      const response = await api.post('/users', backendUser);
      return toUIUser(response.data);
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email) => {
    const response = await api.get(`/users?email=${email}`);
    if (response.data.length === 0) throw new Error('Email not found');
    return true; 
  },

  // --- Shipments ---
  getShipments: async (userId, filters = {}) => {
    try {
       // Filter by customerId (backend field for userId)
       let query = `/shipments`;
       if (userId) {
           query += `?customerId=${userId}`;
       }
       
       const response = await api.get(query);
       let results = response.data.map(toUIShipment);

       if (filters.status) {
         // UI sends 'Delivered', backend has 'DELIVERED' -> Mapped to 'Delivered' by toUIShipment
         // So we compare UI status with UI filter
         results = results.filter(s => s.status === filters.status);
       }
       return results;
    } catch (error) {
        console.error("Get shipments failed", error);
        return [];
    }
  },

  getShipmentById: async (id) => {
    try {
        // ID in UI is trackingNumber
        const response = await api.get(`/shipments?trackingNumber=${id}`);
        if (response.data.length > 0) {
            return toUIShipment(response.data[0]);
        }
        throw new Error('Shipment not found');
    } catch (error) {
         throw new Error('Shipment not found');
    }
  },

  createShipment: async (shipmentData) => {
    try {
        const backendShipment = toBackendShipment(shipmentData);
        // Handle Transaction ID if present (Razorpay integration)
        if (shipmentData.transactionId) {
             const transaction = {
                 transactionId: `TXN${Date.now()}`,
                 shipmentId: backendShipment.shipmentId,
                 date: backendShipment.dates.bookingDate,
                 amount: backendShipment.priceBreakdown.totalAmount,
                 status: 'COMPLETED',
                 description: `Shipment #${backendShipment.trackingNumber}`,
                 paymentGatewayId: shipmentData.transactionId
             };
             await api.post('/transactions', transaction);
        }

        const response = await api.post('/shipments', backendShipment);
        return toUIShipment(response.data);
    } catch (error) {
        console.error("Create shipment failed", error);
        throw error;
    }
  },

  updateShipmentStatus: async (id, status) => {
      // Need to find internal ID first because json-server uses it for PATCH
      // id here is trackingNumber from UI
      const lookup = await api.get(`/shipments?trackingNumber=${id}`);
      if (lookup.data.length === 0) throw new Error("Shipment not found");
      
      const internalId = lookup.data[0].id; // json-server internal id (auto-generated) OR we used shipmentId but json-server default is 'id' ??
      // Wait, json-server uses 'id' field by default. In our new data.json we mostly likely don't have 'id' field for objects unless we add it. 
      // Actually json-server requires 'id' for PUT/PATCH/DELETE by default. 
      // We didn't add 'id' in data.json for shipments, we added 'shipmentId'. 
      // JSON-Server acts weird without 'id'. We should probably either map shipmentId to id OR
      // query the object, get the auto-generated id (if any) or assume we need to fix data.json to include 'id'.
      // Better approach: Let's assume json-server might use 'id' if present, or we can use ?shipmentId=... for GET.
      // BUT for PATCH /shipments/:id, it MUST be the 'id'.
      // **Self-Correction**: All entries in data.json MUST have an 'id' for json-server to work properly for CRUD.
      // I should update data.json to have 'id' matching 'shipmentId' or just use 'id' as primary key.
      
      // FOR NOW, let's assume we fetch the full object, find its internal 'id' (json-server likely adds one or uses what we gave).
      // If we didn't give 'id', json-server might have issues. 
      // *Strategy*: In toBackendShipment, we didn't add 'id'.
      // *Correction*: I will modify data.json to include 'id' field mirroring the primary key for json-server compatibility.
      
      // Let's assume we fix data.json to have 'id' = 'shipmentId' for now.
      
      const realId = lookup.data[0].id || lookup.data[0].shipmentId; // Fallback
      
      const backendStatus = status.toUpperCase().replace(/ /g, '_');
      const response = await api.patch(`/shipments/${realId}`, { status: backendStatus });
      return toUIShipment(response.data);
  },

  // --- Transactions ---
  getTransactions: async (userId) => {
      // In real microservice, we'd query by userId or shipment->userId
      const response = await api.get('/transactions');
      return response.data;
  },
  
  getTransactionById: async (id) => {
      // id is transactionId
      const response = await api.get(`/transactions?transactionId=${id}`);
       if (response.data.length > 0) return response.data[0];
       return null;
  },

  downloadInvoice: async (transactionId) => {
      return true; 
  },

  // --- Support ---
  getTickets: async (userId) => {
      const response = await api.get(`/tickets?userId=${userId}`);
      return response.data;
  },

  createTicket: async (ticketData) => {
      const newTicket = { 
          ticketId: `TKT-${Date.now()}`,
          id: `TKT-${Date.now()}`, // for json-server
          userId: ticketData.userId, // Ensure this is passed
          subject: ticketData.subject,
          message: ticketData.message,
          date: new Date().toISOString().split('T')[0], 
          status: 'OPEN',
          priority: 'MEDIUM',
          createdAt: new Date().toISOString()
      };
      const response = await api.post('/tickets', newTicket);
      return response.data;
  },

  // --- Admin ---
  getBranches: async () => {
      const response = await api.get('/branches');
      return response.data.map(b => ({
          ...b,
          id: b.branchId, // Map for UI
          manager: b.managerName,
          contact: b.contactEmail,
          staffCount: b.stats.staffCount,
          performance: b.stats.performanceScore,
          shipments: b.stats.shipmentVolume,
          revenue: b.stats.revenue
      }));
  },
  
  createBranch: async (branchData) => {
      const id = `BR${Date.now()}`;
      const newBranch = { 
          id: id,
          branchId: id,
          name: branchData.name,
          type: 'HUB',
          location: { address: branchData.location, city: 'Unknown', state: branchData.state },
          managerName: branchData.manager,
          contactEmail: branchData.contact,
          stats: { staffCount: 0, shipmentVolume: 0, revenue: 0, performanceScore: 100 },
          status: 'ACTIVE'
      };
      const response = await api.post('/branches', newBranch);
      return response.data;
  },

  updateBranch: async (id, branchData) => {
     // id is branchId
     // We need to fetch, merge, save.
     // Simplified:
      await api.patch(`/branches/${id}`, { ...branchData }); // This might fail if strict schema, but json-server is loose
      return branchData;
  },

  deleteBranch: async (id) => {
      await api.delete(`/branches/${id}`);
      return true;
  },

  getFleet: async () => {
      const response = await api.get('/fleet');
      return response.data.map(v => ({
          ...v,
          id: v.vehicleId,
          driver: v.driverName,
          vehicleNumber: v.vehicleNumber,
          capacity: `${v.capacityKg}kg`
      }));
  },

  createVehicle: async (vehicleData) => {
      const id = vehicleData.number || `V${Date.now()}`;
      const newVehicle = {
          id: id,
          vehicleId: id,
          vehicleNumber: vehicleData.vehicleNumber,
          type: vehicleData.type.toUpperCase(),
          driverName: vehicleData.driver,
          status: 'ACTIVE',
          capacityKg: parseInt(vehicleData.capacity) || 1000
      };
      const response = await api.post('/fleet', newVehicle);
      return response.data;
  },
  
  updateVehicle: async (id, vehicleData) => {
      await api.patch(`/fleet/${id}`, vehicleData);
      return true;
  },

  deleteVehicle: async (id) => {
      await api.delete(`/fleet/${id}`);
      return true;
  },

  getStaff: async () => {
      const response = await api.get('/staff');
      return response.data.map(s => ({
          ...s,
          id: s.staffId,
          branch: s.branchName
      }));
  },

  createStaff: async (staffData) => {
       const id = `S${Date.now()}`;
       const newStaff = {
           id: id,
           staffId: id,
           name: staffData.name,
           role: staffData.role.toUpperCase(),
           branchName: staffData.branch,
           status: 'ACTIVE',
           phone: staffData.phone,
           documents: { aadhaar: 'PENDING' }
       };
       const response = await api.post('/staff', newStaff);
       return response.data;
  },

  updateStaff: async (id, staffData) => {
      await api.patch(`/staff/${id}`, staffData);
      return true;
  },
  
  deleteStaff: async (id) => {
      await api.delete(`/staff/${id}`);
      return true;
  },
  
  updateUser: async (id, userData) => {
      // UI sends user ID (u1)
      // data.json has id: u1 (we need to ensure this)
      const response = await api.patch(`/users/${id}`, userData);
      return toUIUser(response.data);
  },

  // --- Agent ---
  getCities: async () => {
      const response = await api.get('/cities');
      return response.data;
  },
  
  generateRunSheet: async () => {
      // Mock return
      return {
          id: 'RS-1001',
          date: '2023-10-27',
          driver: 'Mike Driver',
          area: 'Downtown',
          shipments: 12,
          status: 'In Progress'
      };
  },

  getCashCollections: async () => {
      return [];
  },
  
  submitCashCollection: async (dataItem) => {
       return true;
  }
};
