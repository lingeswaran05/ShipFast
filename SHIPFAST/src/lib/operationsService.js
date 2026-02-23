import axios from 'axios';
import { shipmentService } from './shipmentService';
import { resolveServiceBaseUrl } from './apiConfig';

const OPERATIONS_BASE_URL = resolveServiceBaseUrl(import.meta.env.VITE_OPERATIONS_BASE_URL);

import { authStorage } from './authService';

const api = axios.create({
  baseURL: `${OPERATIONS_BASE_URL}/api/operations`,
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

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

export const operationsService = {
  async generateInvoice(invoiceRequest) {
    try {
      const response = await api.post('/invoice', invoiceRequest);
      return getPayload(response);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to generate invoice'));
    }
  },

  async createRunSheet(payload) {
    try {
      const response = await api.post('/runsheet', {
        agentId: payload.agentId,
        hubId: payload.hubId,
        shipmentTrackingNumbers: payload.shipmentTrackingNumbers || []
      });
      const shipmentIds = payload.shipmentTrackingNumbers || [];
      if (shipmentIds.length > 0 && payload.agentId) {
        await Promise.allSettled(
          shipmentIds.map((shipmentId) => shipmentService.assignShipment(shipmentId, payload.agentId))
        );
      }
      return getPayload(response);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create run sheet'));
    }
  },

  async getRunSheetsByAgent(agentId) {
    try {
      const response = await api.get(`/runsheet/${encodeURIComponent(agentId)}`);
      const payload = getPayload(response);
      return Array.isArray(payload) ? payload : payload.content || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load run sheets'));
    }
  },

  async getCashCollections() {
    return [];
  },

  async getAgents() {
    try {
      const response = await api.get('/agents');
      const payload = getPayload(response);
      return Array.isArray(payload) ? payload : payload.content || [];
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load agents'));
    }
  },

  async getAgentProfile(userId) {
    if (!userId) return null;
    try {
      const response = await api.get(`/agents/profile/${encodeURIComponent(userId)}`);
      return getPayload(response);
    } catch {
      return null;
    }
  },

  async upsertAgentProfile(userId, payload) {
    if (!userId) throw new Error('Agent user id is required');
    try {
      const response = await api.put(`/agents/profile/${encodeURIComponent(userId)}`, payload);
      return getPayload(response);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to save agent profile'));
    }
  },

  async verifyAgentProfile(userId, payload) {
    if (!userId) throw new Error('Agent user id is required');
    try {
      const response = await api.put(`/agents/profile/${encodeURIComponent(userId)}/verify`, payload);
      return getPayload(response);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to verify agent profile'));
    }
  }
};
