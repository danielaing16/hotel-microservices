// API Gateway Client para el Frontend de Reservas Hoteleras
const GATEWAY_BASE_URL = (typeof window !== 'undefined' && window.location)
  ? `${window.location.protocol}//${window.location.hostname || 'localhost'}:3000`
  : 'http://localhost:3000';

class HotelApiClient {
  constructor() {
    this.baseUrl = GATEWAY_BASE_URL;
    this.listeners = [];
  }

  onLog(callback) {
    this.listeners.push(callback);
  }

  notifyLog(method, endpoint, status, durationMs, payload = null, error = null) {
    this.listeners.forEach(cb => cb({
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      durationMs,
      payload,
      error
    }));
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const start = Date.now();
    const headers = { ...options.headers };

    // Solo fijar Content-Type: application/json si la petición contiene cuerpo (POST, PUT, PATCH).
    // Para peticiones sin cuerpo (GET, DELETE), no se envía Content-Type para evitar que
    // el body-parser de Express consuma el stream y deje congelada la tubería del Proxy.
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const durationMs = Date.now() - start;
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}`;
        this.notifyLog(options.method || 'GET', endpoint, response.status, durationMs, null, errorMsg);
        throw new Error(errorMsg);
      }

      this.notifyLog(options.method || 'GET', endpoint, response.status, durationMs, data);
      return data;
    } catch (err) {
      const durationMs = Date.now() - start;
      if (!options.silent) {
        this.notifyLog(options.method || 'GET', endpoint, 0, durationMs, null, err.message);
      }
      throw err;
    }
  }

  // Auth Endpoints (vía Gateway: /api/auth/*)
  async register(userData, autoLogin = false) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const token = res?.accessToken || res?.access_token;
    if (autoLogin && res && token) {
      this.saveSession(token, res.user);
    }
    return res;
  }

  async googleLogin(googleData) {
    const res = await this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });

    const token = res?.accessToken || res?.access_token;
    if (res && token) {
      this.saveSession(token, res.user);
    }
    return res;
  }

  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = res?.accessToken || res?.access_token;
    if (res && token) {
      this.saveSession(token, res.user);
    }
    return res;
  }

  async getProfile() {
    return await this.request('/api/auth/profile', {
      method: 'GET',
    });
  }

  async testAdminOnly() {
    return await this.request('/api/auth/admin-only', {
      method: 'GET',
    });
  }

  // Hotels Endpoints (vía Gateway: /api/hotels/*)
  async getHotels(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', filters.city);
    if (filters.stars) params.append('stars', filters.stars);
    if (filters.minStars) params.append('minStars', filters.minStars);
    if (filters.petFriendly !== undefined && filters.petFriendly !== '') {
      params.append('petFriendly', filters.petFriendly);
    }
    if (filters.amenity) params.append('amenity', filters.amenity);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/api/hotels${queryString}`, {
      method: 'GET',
    });
  }

  async getHotelById(id) {
    return await this.request(`/api/hotels/${id}`, {
      method: 'GET',
    });
  }

  async getMyHotels() {
    return await this.request('/api/hotels/admin/my-hotels', {
      method: 'GET',
    });
  }

  async createHotel(hotelData) {
    return await this.request('/api/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
  }

  async updateHotel(id, hotelData) {
    return await this.request(`/api/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData),
    });
  }

  async deleteHotel(id, force = false) {
    return await this.request(`/api/hotels/${id}?force=${force}`, {
      method: 'DELETE',
    });
  }

  async seedHotels() {
    return await this.request('/api/hotels/seed', {
      method: 'POST',
    });
  }

  // =========================================================================
  // Rooms Endpoints (vía Gateway: /api/rooms/*)
  // =========================================================================
  async getRooms(filters = {}) {
    const params = new URLSearchParams();
    ['hotelId', 'roomType', 'status', 'minPrice', 'maxPrice', 'minAdults', 'search', 'page', 'limit'].forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') params.append(key, filters[key]);
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/api/rooms${queryString}`, { method: 'GET' });
  }

  async getRoomTypes(hotelId) {
    const qs = hotelId ? `?hotelId=${encodeURIComponent(hotelId)}` : '';
    return await this.request(`/api/rooms/types${qs}`, { method: 'GET' });
  }

  async createRoom(roomData) {
    return await this.request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(id, roomData) {
    return await this.request(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoomStatus(id, status) {
    return await this.request(`/api/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteRoom(id, force = false) {
    return await this.request(`/api/rooms/${id}?force=${force}`, { method: 'DELETE' });
  }

  async seedRooms() {
    return await this.request('/api/rooms/seed', { method: 'POST' });
  }

  // =========================================================================
  // Notifications Endpoints (vía Gateway: /api/notifications/*)
  // =========================================================================
  async getNotificationStatus() {
    return await this.request('/api/notifications/status', {
      method: 'GET',
      silent: true,
    });
  }

  async getNotificationHistory() {
    return await this.request('/api/notifications/history', {
      method: 'GET',
    });
  }

  getVoucherSampleUrl() {
    return `${this.baseUrl}/api/notifications/voucher/sample`;
  }

  async downloadVoucherPdf(customData) {
    try {
      if (!customData) {
        window.open(this.getVoucherSampleUrl(), '_blank');
        return;
      }
      const token = this.getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.baseUrl}/api/notifications/voucher/preview`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customData),
      });
      if (!res.ok) {
        window.open(this.getVoucherSampleUrl(), '_blank');
        return;
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch {
      window.open(this.getVoucherSampleUrl(), '_blank');
    }
  }

  async sendWelcomeNotification(userData) {
    return await this.request('/api/notifications/send-welcome', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async sendBookingConfirmationNotification(bookingData) {
    return await this.request('/api/notifications/send-booking-confirmation', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async sendPaymentFailedNotification(paymentData) {
    return await this.request('/api/notifications/send-payment-failed', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async sendCheckinReminderNotification(reminderData) {
    return await this.request('/api/notifications/send-checkin-reminder', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  }

  async sendRefundReceiptNotification(refundData) {
    return await this.request('/api/notifications/send-refund-receipt', {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  async getAllUsers() {
    return await this.request('/api/auth/users', {
      method: 'GET',
    });
  }

  async deleteGuests() {
    return await this.request('/api/auth/users/guests', {
      method: 'DELETE',
    });
  }

  async deleteUser(id) {
    return await this.request(`/api/auth/users/${id}`, {
      method: 'DELETE',
    });
  }

  async createStaff(staffData) {
    return await this.request('/api/auth/users', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async setUserStatus(id, isActive) {
    return await this.request(`/api/auth/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // =========================================================================
  // Availability Endpoints (vía Gateway: /api/availability/*)
  // =========================================================================
  async searchAvailability(params = {}) {
    const qs = new URLSearchParams();
    if (params.hotelId) qs.append('hotelId', params.hotelId);
    if (params.checkIn) qs.append('checkIn', params.checkIn);
    if (params.checkOut) qs.append('checkOut', params.checkOut);
    if (params.adults) qs.append('adults', params.adults);
    if (params.children) qs.append('children', params.children);
    return await this.request(`/api/availability/search?${qs.toString()}`, { method: 'GET' });
  }

  async holdRoom(holdData) {
    return await this.request('/api/availability/hold', {
      method: 'POST',
      body: JSON.stringify(holdData),
    });
  }

  async releaseHold(holdId) {
    return await this.request('/api/availability/release', {
      method: 'POST',
      body: JSON.stringify({ holdId }),
    });
  }

  async getRoomCalendar(roomId, year, month) {
    const qs = new URLSearchParams();
    if (year) qs.append('year', year);
    if (month) qs.append('month', month);
    return await this.request(`/api/availability/calendar/${roomId}?${qs.toString()}`, { method: 'GET' });
  }

  async blockDates(blockData) {
    return await this.request('/api/availability/admin/block-dates', {
      method: 'POST',
      body: JSON.stringify(blockData),
    });
  }

  async unblockDates(unblockData) {
    return await this.request('/api/availability/admin/unblock-dates', {
      method: 'POST',
      body: JSON.stringify(unblockData),
    });
  }

  // =========================================================================
  // Bookings Endpoints (vía Gateway: /api/bookings/*)
  // =========================================================================
  async createBooking(bookingData) {
    return await this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return await this.request('/api/bookings/my-bookings', { method: 'GET' });
  }

  async getBooking(idOrCode) {
    return await this.request(`/api/bookings/${idOrCode}`, { method: 'GET' });
  }

  async cancelBooking(idOrCode, reason = '') {
    return await this.request(`/api/bookings/${idOrCode}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async checkInBooking(idOrCode) {
    return await this.request(`/api/bookings/${idOrCode}/checkin`, {
      method: 'PATCH',
    });
  }

  async checkOutBooking(idOrCode) {
    return await this.request(`/api/bookings/${idOrCode}/checkout`, {
      method: 'PATCH',
    });
  }

  async getAllBookings(query = {}) {
    const qs = new URLSearchParams();
    if (query.hotelId) qs.append('hotelId', query.hotelId);
    if (query.status) qs.append('status', query.status);
    if (query.search) qs.append('search', query.search);
    if (query.page) qs.append('page', query.page);
    if (query.limit) qs.append('limit', query.limit);
    const queryString = qs.toString() ? `?${qs.toString()}` : '';
    return await this.request(`/api/bookings${queryString}`, { method: 'GET' });
  }

  // =========================================================================
  // Payments Endpoints (vía Gateway: /api/payments/*)
  // =========================================================================
  async processPayment(paymentData) {
    return await this.request('/api/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getMyPayments() {
    return await this.request('/api/payments/my-payments', { method: 'GET' });
  }

  async getPayment(idOrRef) {
    return await this.request(`/api/payments/${idOrRef}`, { method: 'GET' });
  }

  async refundPayment(idOrRef, reason = '') {
    return await this.request(`/api/payments/${idOrRef}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getAllPayments(params = {}) {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.search) qs.append('search', params.search);
    if (params.limit) qs.append('limit', params.limit);
    return await this.request(`/api/payments?${qs.toString()}`, { method: 'GET' });
  }

  async getPendingPayments() {
    return await this.request('/api/payments/admin/pending', { method: 'GET' });
  }

  async approvePayment(idOrRef) {
    return await this.request(`/api/payments/${idOrRef}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectPayment(idOrRef, reason = '') {
    return await this.request(`/api/payments/${idOrRef}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Health Checks
  async checkGatewayHealth() {
    return await this.request('/health', { method: 'GET', silent: true });
  }

  async checkServicesHealth() {
    return await this.request('/health/services', { method: 'GET', silent: true });
  }

  // Session Storage Management
  saveSession(token, user) {
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('hotel_jwt_token', token);
    }
    if (user) {
      localStorage.setItem('hotel_user_data', JSON.stringify(user));
    }
  }

  clearSession() {
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('hotel_user_data');
  }

  getToken() {
    const token = localStorage.getItem('hotel_jwt_token');
    return (token && token !== 'undefined' && token !== 'null') ? token : null;
  }

  getCurrentUser() {
    const data = localStorage.getItem('hotel_user_data');
    return data ? JSON.parse(data) : null;
  }

}

window.api = window.apiClient = new HotelApiClient();
