import axios from 'axios';
import { authStorage } from './authService';
import { resolveServiceBaseUrl } from './apiConfig';

const SHIPMENT_BASE_URL = resolveServiceBaseUrl(import.meta.env.VITE_SHIPMENT_BASE_URL);

const api = axios.create({
  baseURL: `${SHIPMENT_BASE_URL}/api/v1/shipments`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const splitAddress = (value = '') => {
  const parts = String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (parts.length === 0) return { address: '', city: '', pincode: '' };
  if (parts.length === 1) return { address: parts[0], city: parts[0], pincode: '' };
  if (parts.length === 2) {
    const secondLooksLikePincode = /^[0-9]{4,8}$/.test(parts[1]);
    if (secondLooksLikePincode) {
      return { address: parts[0], city: parts[0], pincode: parts[1] };
    }
    return { address: parts[0], city: parts[1], pincode: '' };
  }
  return {
    address: parts.slice(0, parts.length - 2).join(', ') || parts[0],
    city: parts[parts.length - 2] || '',
    pincode: parts[parts.length - 1] || ''
  };
};

const composeAddress = (address, city, pincode) => {
  return [address, city, pincode].map((item) => String(item || '').trim()).filter(Boolean).join(', ');
};

const normalizeServiceType = (value) => {
  const input = String(value || 'Standard').toLowerCase().replace(/[_-]/g, ' ').trim();
  if (input === 'express') return 'Express';
  if (input === 'same day' || input === 'sameday') return 'Same Day';
  return 'Standard';
};

const normalizePaymentMethod = (value) => {
  const input = String(value || '').toLowerCase().trim();
  if (input === 'cash' || input === 'cod') return 'COD';
  if (input === 'upi') return 'UPI';
  if (input === 'card') return 'CARD';
  return 'ONLINE';
};

const normalizeShipmentStatus = (status) => {
  const raw = String(status || 'Booked').replace(/_/g, ' ').trim().toLowerCase();
  if (!raw) return 'Booked';
  return raw.split(/\s+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const resolveUserIdentifier = (userId) => {
  if (userId) return userId;
  const current = authStorage.getCurrentUser() || {};
  return current.userId || current.id || current.email || '';
};

const mapShipment = (shipment = {}) => {
  const sender = shipment.sender || {};
  const receiver = shipment.recipient || shipment.receiver || {};
  const senderParsed = splitAddress(sender.addressLine || sender.address || '');
  const receiverParsed = splitAddress(receiver.addressLine || receiver.address || '');
  const createdAt = shipment.createdAt ? new Date(shipment.createdAt) : new Date();
  const deliveredAt = shipment.deliveredAt ? new Date(shipment.deliveredAt) : null;
  const paymentMode = shipment.paymentMethod || shipment.paymentMode || 'ONLINE';
  const paymentStatus = shipment.paymentStatus || (String(paymentMode).toUpperCase() === 'COD' ? 'PENDING' : 'SUCCESS');
  const originCity = sender.city || senderParsed.city || shipment.originCity || '';
  const destinationCity = receiver.city || receiverParsed.city || shipment.destinationCity || '';
  const senderAddress = senderParsed.address || sender.address || sender.addressLine || '';
  const receiverAddress = receiverParsed.address || receiver.address || receiver.addressLine || '';
  const normalizedStatus = normalizeShipmentStatus(shipment.status);
  const mappedHistory = Array.isArray(shipment.history)
    ? shipment.history.map((event) => ({
      status: normalizeShipmentStatus(event.status),
      location: event.location || '',
      remarks: event.remarks || '',
      timestamp: event.timestamp || null
    }))
    : [];
  const originValue = shipment.origin || [senderAddress, originCity].filter(Boolean).join(', ');
  const destinationValue = shipment.destination || [receiverAddress, destinationCity].filter(Boolean).join(', ');

  return {
    id: shipment.id || shipment.trackingNumber,
    trackingId: shipment.trackingNumber || shipment.id,
    trackingNumber: shipment.trackingNumber || shipment.id,
    customerId: shipment.customerId || shipment.userId || null,
    status: normalizedStatus,
    service: shipment.serviceType || 'Standard',
    type: shipment.serviceType || 'Standard',
    paymentMode,
    paymentStatus,
    cost: shipment.cost || 0,
    date: createdAt.toISOString().split('T')[0],
    origin: originValue,
    destination: destinationValue,
    assignedAgentId: shipment.assignedAgentId || null,
    proofOfDeliveryImage: shipment.proofOfDeliveryImage || shipment.podImage || null,
    deliveredBy: shipment.deliveredBy || null,
    deliveredByAgentId: shipment.deliveredByAgentId || null,
    rating: shipment.rating ?? null,
    ratingComment: shipment.ratingComment || '',
    deliveryDate: deliveredAt ? deliveredAt.toISOString().split('T')[0] : null,
    history: mappedHistory,
    sender: {
      name: sender.name || '',
      phone: sender.phone || '',
      address: senderAddress,
      city: originCity,
      pincode: senderParsed.pincode
    },
    receiver: {
      name: receiver.name || '',
      phone: receiver.phone || '',
      address: receiverAddress,
      city: destinationCity,
      pincode: receiverParsed.pincode
    },
    weight: shipment.packageDetails?.weight || shipment.weight || 0
  };
};

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

export const shipmentService = {
  async getAllShipments(filters = {}) {
    try {
      const response = await api.get('', {
        params: {
          status: filters.status,
          branchId: filters.branchId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          page: filters.page,
          limit: filters.limit
        }
      });
      const payload = response?.data;
      const list = Array.isArray(payload) ? payload : payload?.data || payload?.content || [];
      return list.map(mapShipment);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load all shipments'));
    }
  },

  async getShipments(userId) {
    try {
      const identifier = resolveUserIdentifier(userId);
      if (!identifier) return [];
      const response = await api.get('/mine', {
        headers: {
          'X-User-Id': identifier
        }
      });
      const payload = response?.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      return list.map(mapShipment);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load shipments'));
    }
  },

  async getShipmentByTracking(id) {
    try {
      const response = await api.get(`/track/${encodeURIComponent(id)}`);
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load shipment'));
    }
  },

  async getShipmentByIdentifier(id) {
    if (!id) throw new Error('Shipment identifier is required');
    try {
      return await this.getShipmentByTracking(id);
    } catch {
      try {
        const response = await api.get(`/${encodeURIComponent(id)}`);
        return mapShipment(response?.data);
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Failed to load shipment'));
      }
    }
  },

  async createShipment(payload, userId) {
    const identifier = resolveUserIdentifier(userId);
    const request = {
      serviceType: normalizeServiceType(payload.type || payload.service),
      paymentMethod: normalizePaymentMethod(payload.paymentMode),
      sender: {
        name: payload.sender?.name,
        phone: payload.sender?.phone,
        address: composeAddress(payload.sender?.address, payload.sender?.city, payload.sender?.pincode)
      },
      recipient: {
        name: payload.receiver?.name,
        phone: payload.receiver?.phone,
        address: composeAddress(payload.receiver?.address, payload.receiver?.city, payload.receiver?.pincode)
      },
      packageDetails: {
        weight: Number(payload.weight || payload.package?.weight || 0),
        type: payload.package?.type || 'Standard',
        description: payload.package?.description || ''
      }
    };

    try {
      const response = await api.post('', request, {
        headers: {
          'X-User-Id': identifier
        }
      });
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create shipment'));
    }
  },

  async updateStatus(id, status, userId, metadata = {}) {
    const requestBody = {
      status: String(status || '').toUpperCase().replace(/ /g, '_')
    };
    if (metadata?.location) requestBody.location = metadata.location;
    if (metadata?.remarks) requestBody.remarks = metadata.remarks;
    if (metadata?.proofOfDeliveryImage) requestBody.proofOfDeliveryImage = metadata.proofOfDeliveryImage;
    if (metadata?.deliveredBy) requestBody.deliveredBy = metadata.deliveredBy;
    if (metadata?.deliveredByAgentId) requestBody.deliveredByAgentId = metadata.deliveredByAgentId;

    try {
      const response = await api.patch(`/${encodeURIComponent(id)}/status`, requestBody, {
        headers: {
          'X-User-Id': userId
        }
      });
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update shipment status'));
    }
  },

  async assignShipment(idOrTracking, agentId) {
    try {
      const response = await api.patch(`/${encodeURIComponent(idOrTracking)}/assign`, {
        agentId
      });
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to assign shipment'));
    }
  },

  async addShipmentRating(idOrTracking, rating, comment = '') {
    try {
      const response = await api.post(`/${encodeURIComponent(idOrTracking)}/rating`, {
        rating: Number(rating),
        comment
      });
      return mapShipment(response?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit shipment rating'));
    }
  },

  async deleteShipment(id) {
    try {
      await api.delete(`/${encodeURIComponent(id)}`);
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete shipment'));
    }
  },

  async calculateRate(request) {
    try {
      const response = await api.post('/calculate-rate', {
        weight: Number(request.weight || 0),
        serviceType: normalizeServiceType(request.serviceType),
        originPincode: request.originPincode,
        destinationPincode: request.destinationPincode
      });
      return response?.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to calculate shipment rate'));
    }
  }
};
