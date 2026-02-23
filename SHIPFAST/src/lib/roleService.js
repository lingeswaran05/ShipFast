import { authService } from './authService';

const API_URL = '/api/v1/roles';

/**
 * Service to handle all role-related API interactions.
 */
export const roleService = {
  /**
   * Submits a request for a role upgrade for the current user.
   * @param {string} requestedRole - The role being requested (e.g., 'agent').
   * @param {string} reason - The reason for the request.
   * @returns {Promise<object>} The created role request object from the backend.
   */
  requestRoleUpgrade: async (requestedRole, reason) => {
    return authService.getAxiosInstance().post(`${API_URL}/requests`, { requestedRole, reason });
  },

  /**
   * Fetches all pending role requests.
   * @returns {Promise<Array<object>>} A list of pending role request objects.
   */
  getPendingRequests: async () => {
    return authService.getAxiosInstance().get(`${API_URL}/requests/pending`);
  },

  /**
   * Approves a role request.
   * This triggers a backend process that should update the user's role.
   * @param {string} requestId - The ID of the role request to approve.
   * @returns {Promise<object>} The updated role request object.
   */
  approveRequest: async (requestId) => {
    return authService.getAxiosInstance().post(`${API_URL}/requests/${requestId}/approve`);
  },

  /**
   * Rejects a role request.
   * @param {string} requestId - The ID of the role request to reject.
   * @returns {Promise<object>} The updated role request object.
   */
  rejectRequest: async (requestId) => {
    return authService.getAxiosInstance().post(`${API_URL}/requests/${requestId}/reject`);
  },
};
