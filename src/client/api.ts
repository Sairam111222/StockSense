/**
 * StockSense Frontend API Client
 * Clean abstraction for frontend components calling backend API endpoints
 */

export const apiClient = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getProducts(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`/api/products?${query.toString()}`);
    return res.json();
  },

  async getProduct(id: string) {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  async getWarehouses() {
    const res = await fetch('/api/warehouses');
    return res.json();
  },

  async getReceipts() {
    const res = await fetch('/api/operations/receipts');
    return res.json();
  },

  async getDeliveries() {
    const res = await fetch('/api/operations/deliveries');
    return res.json();
  },

  async getTransfers() {
    const res = await fetch('/api/operations/transfers');
    return res.json();
  },

  async getAdjustments() {
    const res = await fetch('/api/operations/adjustments');
    return res.json();
  },

  async getAlerts() {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  async getDashboardStats() {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  }
};
