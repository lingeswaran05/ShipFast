import axios from 'axios';
import { authStorage } from './authService';
import { resolveServiceBaseUrl } from './apiConfig';

const COMM_BASE_URL = resolveServiceBaseUrl(import.meta.env.VITE_COMM_BASE_URL);
const LOCAL_NOTIFICATIONS_KEY = 'sf_local_notifications';

const notificationsApi = axios.create({
  baseURL: `${COMM_BASE_URL}/api/notifications`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const supportApi = axios.create({
  baseURL: `${COMM_BASE_URL}/api/support`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const authInterceptor = (config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

notificationsApi.interceptors.request.use(authInterceptor);
supportApi.interceptors.request.use(authInterceptor);

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

const normalizeStatus = (status) => String(status || 'OPEN').replace(/_/g, ' ').toUpperCase();

const mapNotification = (notification = {}) => ({
  id: notification.id || notification.notificationId || `n-${Date.now()}`,
  userId: notification.userId,
  type: notification.type || 'INFO',
  message: notification.message || '',
  status: notification.status || 'SENT',
  isRead: Boolean(notification.isRead),
  timestamp: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : new Date().toLocaleString(),
  role: String(notification.role || '').toLowerCase() || undefined
});

const mapTicketMessage = (message = {}) => ({
  id: message.messageId || message.id || `msg-${Date.now()}`,
  senderId: message.senderId || '',
  senderName: message.senderName || 'Support',
  senderRole: String(message.senderRole || 'admin').toLowerCase(),
  message: message.message || '',
  createdAt: message.createdAt || new Date().toISOString(),
  createdLabel: message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Just now'
});

const mapTicket = (ticket = {}) => ({
  id: ticket.id || ticket.ticketId || `TKT-${Date.now()}`,
  userId: ticket.userId,
  subject: ticket.subject || 'Support Ticket',
  category: ticket.category || 'General',
  message: ticket.description || ticket.message || '',
  priority: ticket.priority || 'Medium',
  status: normalizeStatus(ticket.status),
  assignedToRole: ticket.assignedToRole || 'ADMIN',
  assignedToUserId: ticket.assignedToUserId || '',
  lastUpdate: ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'Just now',
  createdAt: ticket.createdAt || new Date().toISOString(),
  updatedAt: ticket.updatedAt || ticket.createdAt || new Date().toISOString(),
  messages: Array.isArray(ticket.messages) ? ticket.messages.map(mapTicketMessage) : []
});

const readLocalNotifications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalNotifications = (list) => {
  try {
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    // ignore storage failures
  }
};

const saveLocalNotification = (notification) => {
  const current = readLocalNotifications();
  writeLocalNotifications([notification, ...current]);
};

export const communicationService = {
  async sendNotification(userId, type, message) {
    try {
      const response = await notificationsApi.post('/send', null, {
        params: { userId, type, message }
      });
      const mapped = mapNotification(getPayload(response));
      saveLocalNotification(mapped);
      return mapped;
    } catch {
      const fallbackNotification = mapNotification({
        id: `local-${Date.now()}`,
        userId,
        type: type || 'INFO',
        message,
        status: 'LOCAL',
        isRead: false,
        createdAt: new Date().toISOString()
      });
      saveLocalNotification(fallbackNotification);
      return fallbackNotification;
    }
  },

  async getUserNotifications(userId) {
    try {
      const response = await notificationsApi.get(`/${encodeURIComponent(userId)}`);
      const payload = getPayload(response);
      const list = Array.isArray(payload) ? payload : payload.notifications || payload.content || [];
      const mapped = list.map(mapNotification);
      const local = readLocalNotifications().filter((item) => !item.userId || item.userId === userId);
      return [...mapped, ...local].slice(0, 200);
    } catch {
      const local = readLocalNotifications().filter((item) => !item.userId || item.userId === userId);
      return local.map(mapNotification);
    }
  },

  async createTicket(ticketData) {
    try {
      const response = await supportApi.post('/create', {
        userId: ticketData.userId,
        subject: ticketData.subject,
        description: ticketData.message || ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        senderName: ticketData.senderName,
        senderRole: ticketData.senderRole || 'customer'
      });
      return mapTicket(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create ticket'));
    }
  },

  async getUserTickets(userId) {
    try {
      const response = await supportApi.get(`/user/${encodeURIComponent(userId)}`);
      const payload = getPayload(response);
      const list = Array.isArray(payload) ? payload : payload.tickets || payload.content || [];
      return list.map(mapTicket);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch tickets'));
    }
  },

  async getAllTickets(status = '') {
    try {
      const response = await supportApi.get('', {
        params: status ? { status: normalizeStatus(status).replace(/ /g, '_') } : undefined
      });
      const payload = getPayload(response);
      const list = Array.isArray(payload) ? payload : payload.tickets || payload.content || [];
      return list.map(mapTicket);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch all tickets'));
    }
  },

  async replyTicket(ticketId, replyData) {
    try {
      const response = await supportApi.put(`/${encodeURIComponent(ticketId)}/reply`, {
        senderId: replyData.senderId,
        senderName: replyData.senderName,
        senderRole: replyData.senderRole,
        message: replyData.message
      });
      return mapTicket(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to send reply'));
    }
  },

  async updateTicketStatus(ticketId, statusData) {
    try {
      const response = await supportApi.put(`/${encodeURIComponent(ticketId)}/status`, {
        status: normalizeStatus(statusData.status).replace(/ /g, '_'),
        assignedToRole: statusData.assignedToRole,
        assignedToUserId: statusData.assignedToUserId
      });
      return mapTicket(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update ticket status'));
    }
  },

  async closeTicket(ticketId) {
    try {
      const response = await supportApi.put(`/close/${encodeURIComponent(ticketId)}`);
      return mapTicket(getPayload(response));
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to close ticket'));
    }
  },

  async deleteTicket(ticketId) {
    try {
      await supportApi.delete(`/${encodeURIComponent(ticketId)}`);
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete ticket'));
    }
  }
};
