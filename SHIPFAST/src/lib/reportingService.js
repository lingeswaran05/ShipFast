import axios from 'axios';
import { resolveServiceBaseUrl } from './apiConfig';

const REPORTING_BASE_URL = resolveServiceBaseUrl(import.meta.env.VITE_REPORTING_BASE_URL);

const api = axios.create({
  baseURL: `${REPORTING_BASE_URL}/api/reports`,
  timeout: 15000
});

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

export const reportingService = {
  async getSummary() {
    const response = await api.get('/summary');
    return getPayload(response);
  },

  getShipmentCsvUrl() {
    return `${REPORTING_BASE_URL}/api/reports/export/shipments.csv`;
  },

  async downloadShipmentCsv() {
    const response = await axios.get(this.getShipmentCsvUrl(), {
      responseType: 'blob',
      timeout: 20000
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shipments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
