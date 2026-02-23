import axios from 'axios';
import { resolveServiceBaseUrl } from './apiConfig';

const ADMIN_BASE_URL = resolveServiceBaseUrl(import.meta.env.VITE_ADMIN_BASE_URL);

const api = axios.create({
  baseURL: `${ADMIN_BASE_URL}/api/admin`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const mapBranch = (branch = {}) => ({
  id: branch.branchId || branch.id,
  branchId: branch.branchId || branch.id,
  name: branch.name || 'Unnamed Branch',
  type: branch.type || 'Branch',
  location: branch.address || branch.location || '',
  state: branch.state || '',
  manager: branch.manager || branch.managerName || '',
  contact: branch.contact || '',
  status: branch.status || 'Active',
  staffCount: Number(branch.staffCount || 0),
  stats: {
    staffCount: Number(branch.staffCount || 0),
    shipmentVolume: Number(branch.shipmentVolume || 0),
    revenue: Number(branch.revenue || 0),
    performanceScore: Number(branch.performanceScore || 0)
  }
});

const mapVehicle = (vehicle = {}) => ({
  id: vehicle.vehicleId || vehicle.id,
  vehicleId: vehicle.vehicleId || vehicle.id,
  number: vehicle.vehicleNumber || vehicle.number || '',
  vehicleNumber: vehicle.vehicleNumber || vehicle.number || '',
  type: vehicle.type || 'Van',
  capacity: vehicle.capacity || 0,
  driver: vehicle.driverUserId || vehicle.driver || 'N/A',
  rcBook: vehicle.rcBook || '',
  photo: vehicle.photo || null,
  status: vehicle.status || 'Available'
});

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

export const adminService = {
  async createBranch(branchData) {
    try {
      const response = await api.post('/branches', {
        name: branchData.name,
        type: branchData.type,
        address: branchData.location || branchData.address || branchData.state,
        staffCount: Number(branchData.staffCount || 0),
        status: branchData.status || 'Active'
      });
      return mapBranch(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create branch'));
    }
  },

  async getBranches() {
    try {
      const response = await api.get('/branches');
      const payload = getPayload(response);
      const list = Array.isArray(payload) ? payload : payload.content || [];
      return list.map(mapBranch);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load branches'));
    }
  },

  async updateBranch(branchId, branchData) {
    try {
      const response = await api.put(`/branches/${encodeURIComponent(branchId)}`, {
        name: branchData.name,
        type: branchData.type,
        address: branchData.location || branchData.address || branchData.state,
        staffCount: Number(branchData.staffCount || 0),
        status: branchData.status || 'Active'
      });
      return mapBranch(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update branch'));
    }
  },

  async deleteBranch(branchId) {
    try {
      await api.delete(`/branches/${encodeURIComponent(branchId)}`);
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete branch'));
    }
  },

  async createVehicle(vehicleData) {
    try {
      const response = await api.post('/vehicles', {
        vehicleNumber: vehicleData.number || vehicleData.vehicleNumber,
        type: vehicleData.type || 'Van',
        driverUserId: vehicleData.driver || vehicleData.driverName || 'N/A',
        status: vehicleData.status || 'Available'
      });
      return mapVehicle(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create vehicle'));
    }
  },

  async getVehicles() {
    try {
      const response = await api.get('/vehicles');
      const payload = getPayload(response);
      const list = Array.isArray(payload) ? payload : payload.content || [];
      return list.map(mapVehicle);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load vehicles'));
    }
  },

  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await api.put(`/vehicles/${encodeURIComponent(vehicleId)}`, {
        vehicleNumber: vehicleData.number || vehicleData.vehicleNumber,
        type: vehicleData.type || 'Van',
        driverUserId: vehicleData.driver || vehicleData.driverName || 'N/A',
        status: vehicleData.status || 'Available'
      });
      return mapVehicle(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update vehicle'));
    }
  },

  async deleteVehicle(vehicleId) {
    try {
      await api.delete(`/vehicles/${encodeURIComponent(vehicleId)}`);
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete vehicle'));
    }
  }
};
