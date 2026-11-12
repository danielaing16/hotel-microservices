// ============================================================================
// TRAVEL & RESORTS - APLICACIÓN WEB DE EXPERIENCIAS & RESERVAS HOTELERAS
// Controlador Integral del Cliente: Búsqueda, Disponibilidad, Checkout y Recepción
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const api = window.apiClient;

  // --------------------------------------------------------------------------
  // 1. SELECTORES DE CONTENEDORES Y NAVEGACIÓN
  // --------------------------------------------------------------------------
  const authCanvas = document.getElementById('authCanvas');
  const dashboardCanvas = document.getElementById('dashboardCanvas');
  const loginFormView = document.getElementById('loginFormView');
  const registerFormView = document.getElementById('registerFormView');
  const exploreAsGuestBtn = document.getElementById('exploreAsGuestBtn');

  // Alternadores Login / Registro
  const goToRegisterLink = document.getElementById('goToRegisterLink');
  const goToLoginLink = document.getElementById('goToLoginLink');
  const forgotPassLink = document.getElementById('forgotPassLink');

  // Formularios de Auth
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const submitLoginBtn = document.getElementById('submitLoginBtn');
  const submitRegBtn = document.getElementById('submitRegBtn');

  // Modal Google
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const googleAuthModal = document.getElementById('googleAuthModal');
  const closeGoogleModalBtn = document.getElementById('closeGoogleModalBtn');
  const googleCustomForm = document.getElementById('googleCustomForm');

  // Barra Lateral & Usuario
  const dashUserName = document.getElementById('dashUserName');
  const dashUserEmail = document.getElementById('dashUserEmail');
  const dashRoleBadge = document.getElementById('dashRoleBadge');
  const dashAvatar = document.getElementById('dashAvatar');
  const logoutBtn = document.getElementById('logoutBtn');
  const staffSidebarGroup = document.getElementById('staffSidebarGroup');
  const sidebarNavItems = document.querySelectorAll('.dash-nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.dash-tab-content');
  const dashViewTitle = document.getElementById('dashViewTitle');
  const dashViewDesc = document.getElementById('dashViewDesc');
  const toastShelf = document.getElementById('toastShelf');

  // Tab: Hoteles
  const hotelsGrid = document.getElementById('hotelsGrid');
  const filterHotelSearch = document.getElementById('filterHotelSearch');
  const filterHotelCity = document.getElementById('filterHotelCity');
  const filterHotelStars = document.getElementById('filterHotelStars');
  const filterPetFriendly = document.getElementById('filterPetFriendly');
  const openCreateHotelBtn = document.getElementById('openCreateHotelBtn');
  const refreshHotelsBtn = document.getElementById('refreshHotelsBtn');

  // Tab: Disponibilidad
  const availSearchForm = document.getElementById('availSearchForm');
  const availHotelSelect = document.getElementById('availHotelSelect');
  const availCheckIn = document.getElementById('availCheckIn');
  const availCheckOut = document.getElementById('availCheckOut');
  const availGuests = document.getElementById('availGuests');
  const btnSubmitAvailSearch = document.getElementById('btnSubmitAvailSearch');
  const availResultsSummary = document.getElementById('availResultsSummary');
  const availRoomsGrid = document.getElementById('availRoomsGrid');

  // Tab: Habitaciones
  const roomsGrid = document.getElementById('roomsGrid');
  const filterRoomSearch = document.getElementById('filterRoomSearch');
  const filterRoomHotel = document.getElementById('filterRoomHotel');
  const filterRoomType = document.getElementById('filterRoomType');
  const openCreateRoomBtn = document.getElementById('openCreateRoomBtn');
  const refreshRoomsBtn = document.getElementById('refreshRoomsBtn');

  // Tab: Mis Reservas
  const myBookingsList = document.getElementById('myBookingsList');
  const refreshMyBookingsBtn = document.getElementById('refreshMyBookingsBtn');

  // Tab: Recepción
  const receptionSearchInput = document.getElementById('receptionSearchInput');
  const btnReceptionSearch = document.getElementById('btnReceptionSearch');
  const btnReceptionRefresh = document.getElementById('btnReceptionRefresh');
  const receptionTableBody = document.getElementById('receptionTableBody');

  // Tab: Gestión de Cuentas (Solo Admin)
  const adminSidebarGroup = document.getElementById('adminSidebarGroup');
  const usersTableBody = document.getElementById('usersTableBody');
  const createStaffForm = document.getElementById('createStaffForm');
  const submitStaffBtn = document.getElementById('submitStaffBtn');
  const refreshUsersBtn = document.getElementById('refreshUsersBtn');

  // Tab: Pagos & Reembolsos (Solo Admin)
  const paymentsTableBody = document.getElementById('paymentsTableBody');
  const refreshPaymentsBtn = document.getElementById('refreshPaymentsBtn');

  // Modales
  const hotelDetailModal = document.getElementById('hotelDetailModal');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const btnBookFromHotelDetail = document.getElementById('btnBookFromHotelDetail');

  const hotelFormModal = document.getElementById('hotelFormModal');
  const closeFormModalBtn = document.getElementById('closeFormModalBtn');
  const hotelUpsertForm = document.getElementById('hotelUpsertForm');
  const hotelFormTitle = document.getElementById('hotelFormTitle');
  const submitHotelFormBtn = document.getElementById('submitHotelFormBtn');

  const roomFormModal = document.getElementById('roomFormModal');
  const closeRoomModalBtn = document.getElementById('closeRoomModalBtn');
  const roomUpsertForm = document.getElementById('roomUpsertForm');
  const submitRoomFormBtn = document.getElementById('submitRoomFormBtn');

  // Modal Checkout & Hold
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutModalBtn = document.getElementById('closeCheckoutModalBtn');
  const holdCountdownText = document.getElementById('holdCountdownText');
  const checkoutRoomName = document.getElementById('checkoutRoomName');
  const checkoutHotelName = document.getElementById('checkoutHotelName');
  const checkoutCheckIn = document.getElementById('checkoutCheckIn');
  const checkoutCheckOut = document.getElementById('checkoutCheckOut');
  const checkoutNights = document.getElementById('checkoutNights');
  const checkoutGuests = document.getElementById('checkoutGuests');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
  const paymentForm = document.getElementById('paymentForm');
  const cardHolder = document.getElementById('cardHolder');
  const cardNumber = document.getElementById('cardNumber');
  const cardExp = document.getElementById('cardExp');
  const cardCvc = document.getElementById('cardCvc');
  const submitPaymentBtn = document.getElementById('submitPaymentBtn');
  const btnPayText = document.getElementById('btnPayText');

  // Modal Éxito
  const bookingSuccessModal = document.getElementById('bookingSuccessModal');
  const successBookingCode = document.getElementById('successBookingCode');
  const btnDownloadVoucherPdf = document.getElementById('btnDownloadVoucherPdf');
  const btnGoToMyBookingsAfterSuccess = document.getElementById('btnGoToMyBookingsAfterSuccess');

  // Modal Calendario de Disponibilidad & Gestión de Fechas
  const roomCalendarModal = document.getElementById('roomCalendarModal');
  const closeCalModalBtn = document.getElementById('closeCalModalBtn');
  const calRoomTitle = document.getElementById('calRoomTitle');
  const calHotelTitle = document.getElementById('calHotelTitle');
  const calCurrentMonthLabel = document.getElementById('calCurrentMonthLabel');
  const calPrevMonthBtn = document.getElementById('calPrevMonthBtn');
  const calNextMonthBtn = document.getElementById('calNextMonthBtn');
  const calDaysGrid = document.getElementById('calDaysGrid');
  const adminDateControls = document.getElementById('adminDateControls');
  const adminBlockForm = document.getElementById('adminBlockForm');
  const adminCalRoomId = document.getElementById('adminCalRoomId');
  const adminCalHotelId = document.getElementById('adminCalHotelId');
  const adminBlockStart = document.getElementById('adminBlockStart');
  const adminBlockEnd = document.getElementById('adminBlockEnd');
  const adminBlockReason = document.getElementById('adminBlockReason');
  const btnAdminUnblock = document.getElementById('btnAdminUnblock');

  // Controles de Reserva para Huéspedes desde el Calendario
  const clientBookingControls = document.getElementById('clientBookingControls');
  const calClientCheckInText = document.getElementById('calClientCheckInText');
  const calClientCheckOutText = document.getElementById('calClientCheckOutText');
  const calClientNightsText = document.getElementById('calClientNightsText');
  const calClientGuestsSel = document.getElementById('calClientGuestsSel');
  const calClientTotalText = document.getElementById('calClientTotalText');
  const btnProceedBookingFromCalendar = document.getElementById('btnProceedBookingFromCalendar');

  let calSelectedRoomId = null;
  let calSelectedRoomName = '';
  let calSelectedHotelName = '';
  let calSelectedHotelId = null;
  let calSelectedRoomPrice = 450000;
  let calSelectedRoomMaxAdults = 2;
  let calBookingCheckIn = '2026-11-20';
  let calBookingCheckOut = '2026-11-22';
  let calSelectionStep = 0; // 0 = selección de llegada, 1 = selección de salida
  let calCurrentYear = 2026;
  let calCurrentMonth = 11; // Noviembre 2026

  // --------------------------------------------------------------------------
  // ESTADO GLOBAL DE LA APLICACIÓN
  // --------------------------------------------------------------------------
  let selectedHotelForBooking = null;
  let activeHold = null; // { holdId, roomId, hotelId, hotelName, roomName, checkIn, checkOut, guestsCount, quote, timerId, remainingSeconds }
  let lastConfirmedBooking = null;

  const TAB_METADATA = {
    hotels: {
      title: 'Catálogo de Hoteles & Destinos',
      desc: 'Explora nuestras exclusivas propiedades en los destinos más paradisíacos de Colombia.',
    },
    availability: {
      title: 'Buscador de Disponibilidad & Cotización en Tiempo Real',
      desc: 'Consulta tarifas dinámicas, recargos transparentes y bloqueo garantizado de habitaciones.',
    },
    rooms: {
      title: 'Nuestras Habitaciones & Suites',
      desc: 'Conoce los detalles, capacidades, amenidades y confort de cada categoría de habitación.',
    },
    'my-bookings': {
      title: 'Mis Reservas & Vouchers Oficiales',
      desc: 'Gestiona tus estancias, descarga comprobantes oficiales en PDF con código QR y consulta estados.',
    },
    reception: {
      title: 'Portal de Recepción & Fast Check-In',
      desc: 'Control operativo de llegadas de huéspedes, verificación de reservas y registro de Check-In/Check-Out.',
    },
    usuarios: {
      title: 'Gestión de Cuentas & Personal',
      desc: 'Creación de cuentas de personal, activación/desactivación de accesos y administración de huéspedes.',
    },
    pagos: {
      title: 'Conciliación de Pagos & Reembolsos',
      desc: 'Visión financiera global de las transacciones y gestión oficial de reembolsos.',
    },
    notifications: {
      title: 'Worker de Notificaciones & Vouchers PDF',
      desc: 'Monitoreo de eventos en RabbitMQ, emisión de comprobantes con código QR y entrega de correos transaccionales.',
    },
  };

  const ROOM_TYPE_NAMES = {
    STANDARD: 'Standard Room',
    DELUXE: 'Deluxe Suite',
    JUNIOR_SUITE: 'Junior Suite',
    PRESIDENTIAL_SUITE: 'Presidential Suite',
    PENTHOUSE: 'Penthouse Imperial',
  };

  // --------------------------------------------------------------------------
  // FORMATEADOR OFICIAL DE PRECIOS EN PESOS COLOMBIANOS (COP)
  // --------------------------------------------------------------------------
  function getCOPPrice(amount) {
    const val = Number(amount) || 0;
    // Si el valor proviene de base de datos en escala USD (< 1000), se proyecta a COP (x 4.000)
    return val < 1000 ? Math.round(val * 4000) : Math.round(val);
  }

  function formatCOP(amount) {
    const copVal = getCOPPrice(amount);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(copVal) + ' COP';
  }

  // --------------------------------------------------------------------------
  // SISTEMA DE NOTIFICACIONES TOAST ELEGANTE
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    if (!toastShelf) return;
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '🛑';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastShelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --------------------------------------------------------------------------
  // 2. CONTROL DE SESIÓN Y VISTAS PRINCIPALES
  // --------------------------------------------------------------------------
  function refreshSessionView() {
    const token = api.getToken();
    const user = api.getCurrentUser();

    if (token && user) {
      authCanvas.style.display = 'none';
      dashboardCanvas.classList.add('active');

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Huésped Exclusivo';
      if (dashUserName) dashUserName.textContent = fullName;
      if (dashUserEmail) dashUserEmail.textContent = user.email || 'correo@hotel.com';

      const role = user.role || 'GUEST';
      const isAdmin = role === 'HOTEL_ADMIN';

      if (dashRoleBadge) {
        if (isAdmin) {
          dashRoleBadge.textContent = 'ADMINISTRADOR GENERAL';
          dashRoleBadge.className = 'dash-badge admin';
          dashRoleBadge.title = 'Rol HOTEL_ADMIN: Gestión operativa, comercial, de tarifas, control de inventario y supervisión general';
        } else {
          dashRoleBadge.textContent = 'HUÉSPED / VIAJERO';
          dashRoleBadge.className = 'dash-badge guest';
          dashRoleBadge.title = 'Rol GUEST: Búsqueda avanzada, mapas, reservas, cotizaciones y gestión de estancias';
        }
      }

      if (dashAvatar) {
        dashAvatar.textContent = isAdmin ? '👑' : '🌴';
      }

      // Ocultar opciones de cliente al Administrador (Admin no realiza reservas)
      document.querySelectorAll('.guest-only').forEach(el => {
        el.style.display = isAdmin ? 'none' : '';
      });

      // Panel exclusivo del Administrador (Check-In/Out, Cuentas, Pagos)
      if (adminSidebarGroup) {
        adminSidebarGroup.style.display = isAdmin ? 'block' : 'none';
      }
      if (staffSidebarGroup) {
        staffSidebarGroup.style.display = 'none';
      }
      const staffNotifTriggers = document.getElementById('staffNotifTriggers');
      if (staffNotifTriggers) {
        staffNotifTriggers.style.display = isAdmin ? 'block' : 'none';
      }

      const isAdminClean = isAdmin;
      const isStaff = role === 'HOTEL_ADMIN';

      // 1. Recepción & Check-In: Exclusivo de Personal (Admin y Recepción). Oculto para Huéspedes.
      if (staffSidebarGroup) {
        staffSidebarGroup.style.display = isStaff ? 'block' : 'none';
      }
      // 1.c Disparadores de Notificaciones: Exclusivo de Personal
      const staffNotifTriggers = document.getElementById('staffNotifTriggers');
      if (staffNotifTriggers) {
        staffNotifTriggers.style.display = isStaff ? 'block' : 'none';
      }
      // 1.b Gestión de Cuentas y Pagos: Exclusivo del Administrador.
      if (adminSidebarGroup) {
        adminSidebarGroup.style.display = isAdmin ? 'block' : 'none';
      }
      // 2. Registro de Hoteles y Sembrado Demo: Exclusivo de Administradores.
      if (openCreateHotelBtn) {
        openCreateHotelBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      }
      const btnSeedHotels = document.getElementById('btnSeedHotels');
      if (btnSeedHotels) {
        btnSeedHotels.style.display = isAdmin ? 'inline-flex' : 'none';
      }
      // 3. Registro de Habitaciones y Sembrado Demo: Exclusivo de Administradores.
      if (openCreateRoomBtn) {
        openCreateRoomBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      }
      const btnSeedRooms = document.getElementById('btnSeedRooms');
      if (btnSeedRooms) {
        btnSeedRooms.style.display = isAdmin ? 'inline-flex' : 'none';
      }

      loadHotels();
    } else {
      authCanvas.style.display = 'flex';
      dashboardCanvas.classList.remove('active');
      loginFormView.style.display = 'block';
      registerFormView.style.display = 'none';
    }
  }

  // Navegación por pestañas con validación estricta de Roles (RBAC)
  function switchDashboardTab(tabId) {
    const user = api.getCurrentUser();
    const role = user ? (user.role || 'GUEST') : 'GUEST';
    const isStaff = role === 'HOTEL_ADMIN';

    // Protección de ruta: Solo personal del hotel puede ver Recepción
    if (tabId === 'reception' && !isStaff) {
      showToast('Acceso Denegado: El Portal de Recepción es exclusivo para Recepcionistas y Administradores', 'warning');
      tabId = 'hotels';
    }

    // Protección de ruta: Solo el Administrador gestiona cuentas y pagos
    if ((tabId === 'usuarios' || tabId === 'pagos') && role !== 'HOTEL_ADMIN') {
      showToast('Acceso Denegado: esta sección es exclusiva del Administrador General', 'warning');
      tabId = 'hotels';
    }

    sidebarNavItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `view-${tabId}`);
    });

    if (TAB_METADATA[tabId]) {
      if (dashViewTitle) dashViewTitle.textContent = TAB_METADATA[tabId].title;
      if (dashViewDesc) dashViewDesc.textContent = TAB_METADATA[tabId].desc;
    }

    if (tabId === 'hotels') {
      loadHotels();
    } else if (tabId === 'availability') {
      initAvailabilityView();
    } else if (tabId === 'rooms') {
      loadRoomHotels().then(loadRooms);
    } else if (tabId === 'my-bookings') {
      loadMyBookings();
    } else if (tabId === 'reception') {
      loadReceptionBookings();
    } else if (tabId === 'usuarios') {
      loadUsers();
    } else if (tabId === 'pagos') {
      loadPayments();
    } else if (tabId === 'notifications') {
      loadNotificationHistory();
    }
  }

  sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchDashboardTab(tabId);
    });
  });

  // Alternar Login y Registro
  goToRegisterLink?.addEventListener('click', () => {
    loginFormView.style.display = 'none';
    registerFormView.style.display = 'block';
  });

  goToLoginLink?.addEventListener('click', () => {
    registerFormView.style.display = 'none';
    loginFormView.style.display = 'block';
  });

  forgotPassLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Para restablecer tu contraseña, contacta a concierge@travelresorts.com', 'info');
  });

  // Explorar como huésped rápido
  exploreAsGuestBtn?.addEventListener('click', async () => {
    // Si ya tiene sesión, entra al dashboard
    if (api.getToken() && api.getCurrentUser()) {
      refreshSessionView();
      return;
    }

    try {
      showToast('Iniciando sesión como Huésped Invitado...', 'info');
      await api.login('guest@hotel.com', 'guest123');
      showToast('¡Bienvenido a Travel & Resorts!', 'success');
      refreshSessionView();
    } catch {
      // Si no existe, crear o intentar login con credenciales de fallback
      try {
        await api.register({
          firstName: 'Carlos',
          lastName: 'Valderrama',
          email: 'guest@hotel.com',
          phone: '+57 300 123 4567',
          role: 'GUEST',
          password: 'guest123',
        }, true);
        showToast('¡Bienvenido a Travel & Resorts!', 'success');
        refreshSessionView();
      } catch (regErr) {
        // En caso de que ya exista con otra clave, enfocar login
        loginFormView.style.display = 'block';
        registerFormView.style.display = 'none';
        const em = document.getElementById('loginEmail');
        if (em) em.value = 'guest@hotel.com';
        showToast('Ingresa tus credenciales para acceder', 'info');
      }
    }
  });

  // Botones de Acceso Rápido por Rol para Demostración RBAC (1 Clic)
  async function quickLoginAs(email, password, roleLabel) {
    showToast(`Autenticando como ${roleLabel}...`, 'info');
    try {
      const res = await api.login(email, password);
      showToast(`¡Sesión iniciada con éxito! Modo activo: ${roleLabel}`, 'success');
      refreshSessionView();
    } catch (err) {
      showToast(`Error al autenticar: ${err.message}`, 'error');
    }
  }

  document.getElementById('btnQuickGuest')?.addEventListener('click', () => {
    quickLoginAs('guest@hotel.com', 'guest123', 'Huésped (GUEST)');
  });

  
  document.getElementById('btnQuickAdmin')?.addEventListener('click', () => {
    quickLoginAs('admin@hotel.com', 'admin123', 'Administrador General (HOTEL_ADMIN)');
  });

  // Envío de Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    submitLoginBtn.disabled = true;
    submitLoginBtn.innerHTML = '<span>Verificando credenciales...</span>';

    try {
      const res = await api.login(email, password);
      showToast(`¡Bienvenido de nuevo, ${res.user.firstName}!`, 'success');
      refreshSessionView();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitLoginBtn.disabled = false;
      submitLoginBtn.innerHTML = '<span>INICIAR SESIÓN</span>';
    }
  });

  // Envío de Registro
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    submitRegBtn.disabled = true;
    submitRegBtn.innerHTML = '<span>Creando cuenta segura...</span>';

    try {
      await api.register({ firstName, lastName, email, phone, password }, false);
      showToast(`¡Cuenta creada con éxito! Hemos enviado una confirmación a ${email}. Inicia sesión ahora.`, 'success');

      registerForm.reset();
      registerFormView.style.display = 'none';
      loginFormView.style.display = 'block';

      const loginEmailField = document.getElementById('loginEmail');
      const loginPassField = document.getElementById('loginPassword');
      if (loginEmailField) loginEmailField.value = email;
      if (loginPassField) {
        loginPassField.value = '';
        loginPassField.focus();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitRegBtn.disabled = false;
      submitRegBtn.innerHTML = '<span>REGISTRARSE</span>';
    }
  });

  // Modal Google
  googleLoginBtn?.addEventListener('click', () => {
    if (googleAuthModal) googleAuthModal.style.display = 'flex';
  });

  closeGoogleModalBtn?.addEventListener('click', () => {
    if (googleAuthModal) googleAuthModal.style.display = 'none';
  });

  googleAuthModal?.addEventListener('click', (e) => {
    if (e.target === googleAuthModal) googleAuthModal.style.display = 'none';
  });

  googleCustomForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('googleCustomEmail').value.trim();
    const firstName = document.getElementById('googleCustomFirst').value.trim();
    const lastName = document.getElementById('googleCustomLast').value.trim();

    try {
      showToast('Autenticando con Google...', 'info');
      const res = await api.googleLogin({ email, firstName, lastName });
      if (googleAuthModal) googleAuthModal.style.display = 'none';
      showToast(`¡Bienvenido, ${res.user.firstName}!`, 'success');
      refreshSessionView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Cerrar Sesión
  logoutBtn?.addEventListener('click', () => {
    clearActiveHold();
    api.clearSession();
    showToast('Sesión finalizada. ¡Hasta pronto!', 'info');
    refreshSessionView();
  });

  // --------------------------------------------------------------------------
  // 3. CATÁLOGO DE HOTELES (TAB: HOTELES)
  // --------------------------------------------------------------------------
  function extractHotelImg(h) {
    if (Array.isArray(h.images) && h.images.length > 0 && h.images[0]) return h.images[0];
    if (typeof h.images === 'string' && h.images.trim()) return h.images.split(',')[0].trim();
    if (h.mainImageUrl) return h.mainImageUrl;
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  }

  async function loadHotels() {
    const filters = {
      search: filterHotelSearch?.value.trim() || undefined,
      city: filterHotelCity?.value || undefined,
      stars: filterHotelStars?.value || undefined,
      petFriendly: filterPetFriendly?.checked ? true : undefined,
    };

    try {
      const res = await api.getHotels(filters);
      renderHotels(res.data || []);
    } catch (err) {
      if (hotelsGrid) {
        hotelsGrid.innerHTML = `
          <div class="empty-hotels-box">
            <span style="color: #f87171;">Error al consultar catálogo: ${err.message}</span>
          </div>
        `;
      }
    }
  }

  function renderHotels(hotels = []) {
    if (!hotelsGrid) return;

    if (hotels.length === 0) {
      hotelsGrid.innerHTML = `
        <div class="empty-hotels-box">
          <span>No se encontraron hoteles con los criterios seleccionados.</span>
          <span style="font-size: 0.75rem; margin-top: 0.5rem;">Intenta limpiar los filtros de búsqueda.</span>
        </div>
      `;
      return;
    }

    const currentUser = api.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'HOTEL_ADMIN';

    hotelsGrid.innerHTML = hotels.map(h => {
      const starsStr = '⭐'.repeat(h.stars || 5);
      const isPet = h.petFriendly ?? h.isPetFriendly;
      const petStr = isPet ? '🐾 Pet-friendly' : '🚫 No mascotas';
      const amenitiesStr = Array.isArray(h.amenities)
        ? h.amenities.slice(0, 3).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('')
        : '';
      const hotelImg = extractHotelImg(h);

      const adminButtons = isAdmin ? `
        <div class="hotel-admin-actions">
          <button class="btn-card-edit" data-id="${h.id}" title="Editar Sede">✏️</button>
          <button class="btn-card-delete" data-id="${h.id}" data-name="${h.name}" title="Desactivar Sede">🗑️</button>
        </div>
      ` : '';

      return `
        <div class="hotel-card" data-id="${h.id}">
          <div class="hotel-card-media">
            <img src="${hotelImg}" alt="${h.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-stars">${starsStr}</div>
            <div class="badge-city">${h.city || 'Colombia'}</div>
            ${adminButtons}
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${h.name}</h3>
            <div class="hotel-card-location">📍 ${h.address}, ${h.city}</div>
            <p class="hotel-card-desc">${h.description ? h.description.substring(0, 115) + '...' : ''}</p>
            <div class="hotel-amenities-tags">${amenitiesStr}</div>
          </div>
          <div class="hotel-card-footer">
            <div class="hotel-policy-pill">${petStr}</div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-hotel-detail" data-id="${h.id}" style="padding: 7px 12px; font-size: 0.78rem;">Ver Ficha</button>
              <button class="btn-blue btn-quick-book" data-id="${h.id}" data-name="${h.name}" style="padding: 7px 12px; font-size: 0.78rem;">Reservar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Eventos de botones de tarjeta
    document.querySelectorAll('.btn-hotel-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openHotelDetail(btn.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.btn-quick-book').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hotelId = btn.getAttribute('data-id');
        openAvailabilityForHotel(hotelId);
      });
    });

    document.querySelectorAll('.btn-card-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditHotelModal(btn.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.btn-card-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (confirm(`¿Confirmas que deseas desactivar la sede "${name}"?`)) {
          try {
            await api.deleteHotel(id);
            showToast(`Sede "${name}" desactivada`, 'info');
            loadHotels();
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      });
    });
  }

  // Abrir Modal de Detalle de Hotel
  async function openHotelDetail(id) {
    try {
      const hotel = await api.getHotelById(id);
      selectedHotelForBooking = hotel;

      const hotelImg = extractHotelImg(hotel);
      const isPet = hotel.petFriendly ?? hotel.isPetFriendly;

      document.getElementById('detailTitle').textContent = hotel.name;
      document.getElementById('detailAddress').textContent = `📍 ${hotel.address}, ${hotel.city}`;
      document.getElementById('detailDescription').textContent = hotel.description;
      document.getElementById('detailStars').textContent = '⭐'.repeat(hotel.stars || 5);
      document.getElementById('detailCity').textContent = hotel.city;
      document.getElementById('detailImg').src = hotelImg;
      document.getElementById('detailCheckIn').textContent = hotel.checkInTime || '15:00';
      document.getElementById('detailCheckOut').textContent = hotel.checkOutTime || '11:00';
      document.getElementById('detailPetFriendly').textContent = isPet ? '🐾 Sí, hotel pet-friendly' : '🚫 No se admiten mascotas';
      document.getElementById('detailPetFriendly').style.color = isPet ? '#34d399' : '#f87171';
      document.getElementById('detailContact').textContent = `${hotel.phone || hotel.contactPhone || 'N/A'} | ${hotel.email || hotel.contactEmail || 'N/A'}`;
      document.getElementById('detailCancellation').textContent = hotel.cancellationPolicy || 'Cancelación gratuita hasta 48 horas antes de la llegada.';

      const amenitiesBox = document.getElementById('detailAmenities');
      amenitiesBox.innerHTML = Array.isArray(hotel.amenities)
        ? hotel.amenities.map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('')
        : '<span style="color: var(--text-dim);">Sin amenidades registradas</span>';

      hotelDetailModal.style.display = 'flex';
    } catch (err) {
      showToast(`Error al consultar hotel: ${err.message}`, 'error');
    }
  }

  // Redirigir desde modal de detalle hacia el buscador de disponibilidad
  btnBookFromHotelDetail?.addEventListener('click', () => {
    hotelDetailModal.style.display = 'none';
    if (selectedHotelForBooking) {
      openAvailabilityForHotel(selectedHotelForBooking.id);
    } else {
      switchDashboardTab('availability');
    }
  });

  function openAvailabilityForHotel(hotelId) {
    switchDashboardTab('availability');
    setTimeout(() => {
      if (availHotelSelect) {
        availHotelSelect.value = hotelId;
        triggerAvailabilitySearch();
      }
    }, 150);
  }

  // Crear o Editar Hotel (HOTEL_ADMIN)
  openCreateHotelBtn?.addEventListener('click', () => {
    hotelUpsertForm.reset();
    document.getElementById('formHotelId').value = '';
    hotelFormTitle.textContent = '🏢 Registrar Nueva Sede Hotelera';
    hotelFormModal.style.display = 'flex';
  });

  const btnSeedHotels = document.getElementById('btnSeedHotels');
  btnSeedHotels?.addEventListener('click', async () => {
    if (!confirm('¿Deseas poblar el catálogo hotelero con las sedes oficiales demo (Cartagena, San Andrés, Santa Marta, etc.)?')) return;
    try {
      showToast('Sembrando catálogo de hoteles demo...', 'info');
      await api.seedHotels();
      showToast('¡Hoteles demo sembrados exitosamente!', 'success');
      loadHotels();
    } catch (err) {
      showToast(`Error al sembrar hoteles: ${err.message}`, 'error');
    }
  });

  async function openEditHotelModal(id) {
    try {
      const hotel = await api.getHotelById(id);
      const isPet = hotel.petFriendly ?? hotel.isPetFriendly;
      const firstImg = Array.isArray(hotel.images) ? hotel.images.join(', ') : (hotel.images || hotel.mainImageUrl || '');

      document.getElementById('formHotelId').value = hotel.id;
      document.getElementById('formHotelName').value = hotel.name;
      document.getElementById('formHotelDesc').value = hotel.description;
      document.getElementById('formHotelAddress').value = hotel.address;
      document.getElementById('formHotelCity').value = hotel.city;
      document.getElementById('formHotelStars').value = hotel.stars || 5;
      document.getElementById('formHotelPhone').value = hotel.phone || hotel.contactPhone || '';
      document.getElementById('formHotelEmail').value = hotel.email || hotel.contactEmail || '';
      document.getElementById('formHotelImg').value = firstImg;
      document.getElementById('formHotelAmenities').value = Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '';
      document.getElementById('formHotelCheckIn').value = hotel.checkInTime || '15:00';
      document.getElementById('formHotelCheckOut').value = hotel.checkOutTime || '11:00';
      document.getElementById('formHotelCancel').value = hotel.cancellationPolicy || '';
      document.getElementById('formHotelPetFriendly').checked = !!isPet;

      hotelFormTitle.textContent = `✏️ Editar Sede: ${hotel.name}`;
      hotelFormModal.style.display = 'flex';
    } catch (err) {
      showToast(`Error preparando formulario: ${err.message}`, 'error');
    }
  }

  hotelUpsertForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitHotelFormBtn.disabled = true;
    submitHotelFormBtn.innerHTML = '<span>Guardando cambios...</span>';

    const id = document.getElementById('formHotelId').value;
    const amenitiesRaw = document.getElementById('formHotelAmenities').value;
    const amenitiesList = amenitiesRaw ? amenitiesRaw.split(',').map(a => a.trim()).filter(Boolean) : [];
    const imgRaw = document.getElementById('formHotelImg').value.trim();
    const imagesList = imgRaw ? imgRaw.split(',').map(s => s.trim()).filter(Boolean) : [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ];

    const payload = {
      name: document.getElementById('formHotelName').value.trim(),
      description: document.getElementById('formHotelDesc').value.trim(),
      address: document.getElementById('formHotelAddress').value.trim(),
      city: document.getElementById('formHotelCity').value.trim(),
      stars: parseInt(document.getElementById('formHotelStars').value, 10),
      phone: document.getElementById('formHotelPhone').value.trim() || '+57 300 123 4567',
      email: document.getElementById('formHotelEmail').value.trim() || 'reservas@hotel.com',
      images: imagesList,
      amenities: amenitiesList.length ? amenitiesList : ['WiFi', 'Piscina', 'Restaurante'],
      checkInTime: document.getElementById('formHotelCheckIn').value.trim() || '15:00',
      checkOutTime: document.getElementById('formHotelCheckOut').value.trim() || '11:00',
      cancellationPolicy: document.getElementById('formHotelCancel').value.trim() || 'Cancelación gratuita hasta 48 horas antes.',
      petFriendly: document.getElementById('formHotelPetFriendly').checked,
    };

    try {
      if (id) {
        await api.updateHotel(id, payload);
        showToast('Sede actualizada exitosamente', 'success');
      } else {
        await api.createHotel(payload);
        showToast('Nueva sede registrada exitosamente', 'success');
      }
      hotelFormModal.style.display = 'none';
      loadHotels();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitHotelFormBtn.disabled = false;
      submitHotelFormBtn.innerHTML = '<span>GUARDAR HOTEL</span>';
    }
  });

  refreshHotelsBtn?.addEventListener('click', () => {
    loadHotels();
    showToast('Catálogo actualizado', 'info');
  });

  closeDetailModalBtn?.addEventListener('click', () => hotelDetailModal.style.display = 'none');
  closeFormModalBtn?.addEventListener('click', () => hotelFormModal.style.display = 'none');
  hotelDetailModal?.addEventListener('click', (e) => { if (e.target === hotelDetailModal) hotelDetailModal.style.display = 'none'; });
  hotelFormModal?.addEventListener('click', (e) => { if (e.target === hotelFormModal) hotelFormModal.style.display = 'none'; });

  let filterHotelDebounce = null;
  filterHotelSearch?.addEventListener('input', () => {
    clearTimeout(filterHotelDebounce);
    filterHotelDebounce = setTimeout(loadHotels, 350);
  });
  filterHotelCity?.addEventListener('change', loadHotels);
  filterHotelStars?.addEventListener('change', loadHotels);
  filterPetFriendly?.addEventListener('change', loadHotels);

  // --------------------------------------------------------------------------
  // 4. BUSCADOR DE DISPONIBILIDAD & COTIZACIÓN EN VIVO (TAB: DISPONIBILIDAD)
  // --------------------------------------------------------------------------
  async function initAvailabilityView() {
    // 1. Cargar selector de hoteles si no está cargado
    try {
      const res = await api.getHotels({ limit: 100 });
      const hotels = res.data || [];
      if (availHotelSelect) {
        const cur = availHotelSelect.value;
        availHotelSelect.innerHTML = hotels.map(h => `<option value="${h.id}">${h.name} (${h.city})</option>`).join('');
        if (cur) availHotelSelect.value = cur;
      }
    } catch (err) {
      console.warn('Error cargando hoteles para selector de disponibilidad:', err);
    }

    // 2. Establecer fechas por defecto si están vacías
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkOutDate = new Date(tomorrow);
    checkOutDate.setDate(checkOutDate.getDate() + 3);

    const fmt = (d) => d.toISOString().split('T')[0];

    if (availCheckIn && !availCheckIn.value) {
      availCheckIn.min = fmt(today);
      availCheckIn.value = fmt(tomorrow);
    }
    if (availCheckOut && !availCheckOut.value) {
      availCheckOut.min = fmt(tomorrow);
      availCheckOut.value = fmt(checkOutDate);
    }

    // Si ya hay un hotel seleccionado, realizar búsqueda automática inicial
    if (availHotelSelect?.value) {
      triggerAvailabilitySearch();
    }
  }

  availCheckIn?.addEventListener('change', () => {
    if (availCheckIn.value && availCheckOut) {
      const nextDay = new Date(availCheckIn.value);
      nextDay.setDate(nextDay.getDate() + 1);
      availCheckOut.min = nextDay.toISOString().split('T')[0];
      if (availCheckOut.value <= availCheckIn.value) {
        availCheckOut.value = nextDay.toISOString().split('T')[0];
      }
    }
  });

  availSearchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    triggerAvailabilitySearch();
  });

  async function triggerAvailabilitySearch() {
    const hotelId = availHotelSelect?.value;
    const checkIn = availCheckIn?.value;
    const checkOut = availCheckOut?.value;
    const guests = parseInt(availGuests?.value || '2', 10);

    if (!hotelId || !checkIn || !checkOut) {
      showToast('Por favor selecciona el hotel y las fechas de tu viaje', 'warning');
      return;
    }

    if (checkIn >= checkOut) {
      showToast('La fecha de entrada debe ser anterior a la de salida', 'warning');
      return;
    }

    if (btnSubmitAvailSearch) {
      btnSubmitAvailSearch.disabled = true;
      btnSubmitAvailSearch.innerHTML = '<span>Consultando...</span>';
    }

    if (availRoomsGrid) {
      availRoomsGrid.innerHTML = `
        <div class="empty-hotels-box">
          <span>Consultando tarifas y disponibilidad en tiempo real...</span>
        </div>
      `;
    }

    try {
      const data = await api.searchAvailability({
        hotelId,
        checkIn,
        checkOut,
        adults: guests,
      });

      renderAvailabilityResults(data, { hotelId, checkIn, checkOut, guests });
    } catch (err) {
      if (availRoomsGrid) {
        availRoomsGrid.innerHTML = `
          <div class="empty-hotels-box">
            <span style="color: #f87171;">Error al consultar disponibilidad: ${err.message}</span>
          </div>
        `;
      }
    } finally {
      if (btnSubmitAvailSearch) {
        btnSubmitAvailSearch.disabled = false;
        btnSubmitAvailSearch.innerHTML = '<span>BUSCAR</span>';
      }
    }
  }

  function renderAvailabilityResults(data, searchParams) {
    const rooms = data?.rooms || [];

    if (availResultsSummary) {
      availResultsSummary.textContent = `Resultados: ${rooms.length} categoría(s) de habitación con disponibilidad inmediata del ${searchParams.checkIn} al ${searchParams.checkOut}`;
    }

    if (!availRoomsGrid) return;

    if (rooms.length === 0) {
      availRoomsGrid.innerHTML = `
        <div class="empty-hotels-box">
          <span>No encontramos habitaciones disponibles para las fechas o cantidad de huéspedes seleccionados.</span>
          <span style="font-size: 0.78rem; margin-top: 0.4rem; color: var(--text-dim);">Prueba con otras fechas o reduce el número de personas.</span>
        </div>
      `;
      return;
    }

    availRoomsGrid.innerHTML = rooms.map(r => {
      const img = (Array.isArray(r.images) && r.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';
      const typeLabel = ROOM_TYPE_NAMES[r.roomType] || r.roomType;
      const quote = r.quote || {};
      const nights = quote.nights || 1;
      const baseRate = getCOPPrice(quote.basePricePerNight || 350000);
      const surcharges = getCOPPrice(quote.surcharges || 0);
      const totalAmount = getCOPPrice(quote.totalAmount || (baseRate * nights));

      const weekendNotice = surcharges > 0
        ? `<div style="font-size: 0.72rem; color: #fbbf24; margin-top: 2px;">⚡ Incluye +${formatCOP(surcharges)} (Recargo fin de semana)</div>`
        : '';

      const amenitiesHtml = (r.amenities || []).slice(0, 3).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('');

      return `
        <div class="hotel-card" data-room-id="${r.id}">
          <div class="hotel-card-media">
            <img src="${img}" alt="${r.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-stars">${typeLabel}</div>
            <div class="badge-city">#${r.roomNumber} · Vista ${r.viewType || 'Panorámica'}</div>
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${r.name}</h3>
            <div class="hotel-card-location">🏨 ${r.hotelName || 'Sede Principal'}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin: 0.5rem 0;">
              👥 Hasta ${r.maxAdults} adultos · 🛏️ ${r.bedType || 'Cama King'} · 📐 ${r.sizeSqm || 35} m²
            </div>
            <div class="hotel-amenities-tags">${amenitiesHtml}</div>

            <!-- Desglose de Cotización Transparente -->
            <div class="quote-breakdown-card" style="margin-top: 0.85rem; padding: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim);">
                <span>Tarifa base (${nights} ${nights === 1 ? 'noche' : 'noches'}):</span>
                <span>${formatCOP(baseRate * nights)}</span>
              </div>
              ${weekendNotice}
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.1);">
                <span style="font-size: 0.78rem; font-weight: 700; color: #fff;">Total Estancia:</span>
                <span style="font-size: 1.15rem; font-weight: 900; color: #34d399;">${formatCOP(totalAmount)}</span>
              </div>
            </div>
          </div>
          <div class="hotel-card-footer">
            <div style="font-size: 0.72rem; color: #38bdf8;">✨ Bloqueo garantizado 10 min</div>
            <button class="btn-blue btn-start-booking"
              data-room-id="${r.id}"
              data-room-name="${r.name}"
              data-hotel-id="${r.hotelId || searchParams.hotelId}"
              data-hotel-name="${r.hotelName || 'Hotel de Lujo'}"
              data-total="${totalAmount}"
              data-nights="${nights}"
              data-checkin="${searchParams.checkIn}"
              data-checkout="${searchParams.checkOut}"
              data-guests="${searchParams.guests}"
              style="padding: 8px 16px; font-size: 0.82rem;">
              <span>RESERVAR AHORA</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Eventos para iniciar reserva
    document.querySelectorAll('.btn-start-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        const payload = {
          roomId: btn.getAttribute('data-room-id'),
          roomName: btn.getAttribute('data-room-name'),
          hotelId: btn.getAttribute('data-hotel-id'),
          hotelName: btn.getAttribute('data-hotel-name'),
          totalAmount: parseFloat(btn.getAttribute('data-total')),
          nights: parseInt(btn.getAttribute('data-nights'), 10),
          checkIn: btn.getAttribute('data-checkin'),
          checkOut: btn.getAttribute('data-checkout'),
          guestsCount: parseInt(btn.getAttribute('data-guests'), 10),
        };
        startCheckoutFlow(payload);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. FLUJO DE CHECKOUT, BLOQUEO TEMPORAL (SOFT-LOCK) Y PAGO CON TARJETA
  // --------------------------------------------------------------------------
  async function startCheckoutFlow(item) {
    showToast('Adquiriendo bloqueo temporal de 10 minutos...', 'info');

    try {
      // 1. Crear el hold atómico en availability-service (Redis Lua)
      const holdRes = await api.holdRoom({
        roomId: item.roomId,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        guestsCount: item.guestsCount,
        ttlSeconds: 600, // 10 minutos
      });

      const holdId = holdRes.holdId;

      activeHold = {
        holdId,
        roomId: item.roomId,
        roomName: item.roomName,
        hotelId: item.hotelId,
        hotelName: item.hotelName,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        nights: item.nights,
        guestsCount: item.guestsCount,
        totalAmount: item.totalAmount,
        remainingSeconds: 600,
      };

      // 2. Poblar Modal de Checkout
      if (checkoutRoomName) checkoutRoomName.textContent = item.roomName;
      if (checkoutHotelName) checkoutHotelName.textContent = item.hotelName;
      if (checkoutCheckIn) checkoutCheckIn.textContent = item.checkIn;
      if (checkoutCheckOut) checkoutCheckOut.textContent = item.checkOut;
      if (checkoutNights) checkoutNights.textContent = `${item.nights} noche(s)`;
      if (checkoutGuests) checkoutGuests.textContent = `${item.guestsCount} persona(s)`;
      if (checkoutTotalAmount) checkoutTotalAmount.textContent = formatCOP(item.totalAmount);

      // Autocompletar datos de tarjeta demo para conveniencia del evaluador
      const currentUser = api.getCurrentUser();
      if (cardHolder && currentUser) {
        cardHolder.value = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Carlos Valderrama';
      }
      if (cardNumber) cardNumber.value = '4242 4242 4242 4242';
      if (cardExp) cardExp.value = '12/28';
      if (cardCvc) cardCvc.value = '888';

      // 3. Iniciar temporizador de 10 minutos (600 segundos)
      startHoldCountdown(600);

      // 4. Mostrar Modal
      checkoutModal.style.display = 'flex';
      showToast('¡Habitación reservada exclusivamente para ti durante 10 minutos!', 'success');
    } catch (err) {
      showToast(`No se pudo bloquear la habitación: ${err.message}`, 'error');
    }
  }

  function startHoldCountdown(seconds) {
    if (activeHold?.timerId) {
      clearInterval(activeHold.timerId);
    }

    let remaining = seconds;
    updateHoldTimerDisplay(remaining);

    const timerId = setInterval(() => {
      remaining -= 1;
      if (activeHold) activeHold.remainingSeconds = remaining;
      updateHoldTimerDisplay(remaining);

      if (remaining <= 0) {
        clearInterval(timerId);
        checkoutModal.style.display = 'none';
        showToast('El tiempo de reserva de 10 minutos ha expirado. Cotiza nuevamente.', 'warning');
        activeHold = null;
        triggerAvailabilitySearch();
      }
    }, 1000);

    if (activeHold) activeHold.timerId = timerId;
  }

  function updateHoldTimerDisplay(totalSeconds) {
    if (!holdCountdownText) return;
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    holdCountdownText.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function clearActiveHold() {
    if (activeHold?.timerId) {
      clearInterval(activeHold.timerId);
    }
    if (activeHold?.holdId) {
      api.releaseHold(activeHold.holdId).catch(() => {});
    }
    activeHold = null;
  }

  closeCheckoutModalBtn?.addEventListener('click', () => {
    if (confirm('¿Deseas cancelar el proceso de pago y liberar la habitación?')) {
      clearActiveHold();
      checkoutModal.style.display = 'none';
      showToast('Habitación liberada correctamente', 'info');
    }
  });

  // Formato para inputs de tarjeta de crédito
  cardNumber?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  cardExp?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      e.target.value = val.substring(0, 2) + '/' + val.substring(2);
    } else {
      e.target.value = val;
    }
  });

  // Procesar Pago y Confirmar Reserva (Anti-Doble Cobro vía Idempotency Key)
  paymentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!activeHold) {
      showToast('No hay una habitación activa en bloqueo temporal', 'error');
      return;
    }

    submitPaymentBtn.disabled = true;
    if (btnPayText) btnPayText.textContent = 'PROCESANDO PAGO SEGURO (SAGA)...';

    try {
      // 1. Crear Reserva en booking-service con el holdId adquirido
      showToast('Creando registro de reserva con bloqueo...', 'info');
      const bookingPayload = {
        roomId: activeHold.roomId,
        hotelId: activeHold.hotelId,
        checkIn: activeHold.checkIn,
        checkOut: activeHold.checkOut,
        guestsCount: activeHold.guestsCount,
        holdId: activeHold.holdId,
        specialRequests: 'Reserva confirmada vía Web Luxury Portal',
      };

      const booking = await api.createBooking(bookingPayload);

      // 2. Procesar Pago en payment-service con Idempotencia
      showToast('Procesando transacción con pasarela de pagos...', 'info');
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const rawCard = (cardNumber?.value || '4242424242424242').replace(/\s+/g, '');

      const paymentPayload = {
        bookingId: booking.id,
        idempotencyKey,
        amount: Number(booking.totalAmount),
        currency: booking.currency || 'COP',
        paymentMethod: 'CREDIT_CARD',
        cardNumber: rawCard,
        cardHolderName: cardHolder?.value.trim() || 'Huésped Titular',
        cardExp: cardExp?.value.trim() || '12/28',
        cardCvc: cardCvc?.value.trim() || '123',
      };

      const paymentResult = await api.processPayment(paymentPayload);

      // 3. Detener temporizador y cerrar modal de pago
      if (activeHold.timerId) clearInterval(activeHold.timerId);
      activeHold = null;
      checkoutModal.style.display = 'none';

      // 4. Guardar datos para descarga de voucher
      lastConfirmedBooking = {
        bookingId: booking.id,
        bookingReference: booking.bookingCode,
        userEmail: booking.userEmail,
        userName: booking.userName,
        hotelName: booking.hotelName,
        hotelAddress: 'Dirección confirmada en voucher',
        hotelCity: 'Colombia',
        roomTypeName: booking.roomName,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut,
        nights: booking.nights,
        guestsCount: booking.guestsCount,
        totalAmount: booking.totalAmount,
        currency: booking.currency || 'COP',
        paymentId: paymentResult.id || `PAY-${Date.now().toString(36).toUpperCase()}`,
        paymentMethod: `Tarjeta terminada en ${rawCard.slice(-4)}`,
      };

      // 5. Mostrar Modal de Éxito con Código Único
      if (successBookingCode) {
        successBookingCode.textContent = booking.bookingCode;
      }
      bookingSuccessModal.style.display = 'flex';
      showToast('¡Pago exitoso y reserva 100% confirmada!', 'success');
    } catch (err) {
      showToast(`Error al completar la reserva: ${err.message}`, 'error');
    } finally {
      submitPaymentBtn.disabled = false;
      if (btnPayText) btnPayText.textContent = 'PAGAR Y CONFIRMAR RESERVA';
    }
  });

  // Descarga de Voucher PDF con QR desde modal de éxito
  btnDownloadVoucherPdf?.addEventListener('click', () => {
    showToast('Generando Voucher PDF oficial con código QR...', 'info');
    api.downloadVoucherPdf(lastConfirmedBooking);
  });

  btnGoToMyBookingsAfterSuccess?.addEventListener('click', () => {
    bookingSuccessModal.style.display = 'none';
    switchDashboardTab('my-bookings');
  });

  bookingSuccessModal?.addEventListener('click', (e) => {
    if (e.target === bookingSuccessModal) bookingSuccessModal.style.display = 'none';
  });

  // --------------------------------------------------------------------------
  // 6. MIS RESERVAS & COMPROBANTES DIGITALES (TAB: MIS RESERVAS)
  // --------------------------------------------------------------------------
  async function loadMyBookings() {
    if (!myBookingsList) return;

    myBookingsList.innerHTML = `
      <div class="empty-hotels-box">
        <span>Consultando tus reservas registradas...</span>
      </div>
    `;

    try {
      const bookings = await api.getMyBookings();
      renderMyBookings(bookings || []);
    } catch (err) {
      myBookingsList.innerHTML = `
        <div class="empty-hotels-box">
          <span style="color: #f87171;">Error al consultar reservas: ${err.message}</span>
        </div>
      `;
    }
  }

  const BOOKING_STATUS_MAP = {
    CONFIRMED: { label: 'Confirmada', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
    CHECKED_IN: { label: 'En Estancia (Check-In)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    COMPLETED: { label: 'Finalizada (Check-Out)', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
    CANCELLED: { label: 'Cancelada', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
    PENDING_PAYMENT: { label: 'Pendiente de Pago', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  };

  function renderMyBookings(bookings = []) {
    if (!myBookingsList) return;

    if (bookings.length === 0) {
      myBookingsList.innerHTML = `
        <div class="empty-hotels-box">
          <span>Aún no tienes estancias reservadas.</span>
          <span style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-dim);">
            Utiliza la pestaña "Buscar Disponibilidad" para elegir tus próximas vacaciones.
          </span>
        </div>
      `;
      return;
    }

    myBookingsList.innerHTML = bookings.map(b => {
      const st = BOOKING_STATUS_MAP[b.status] || { label: b.status, color: '#fff', bg: 'rgba(255,255,255,0.1)' };
      const canCancel = b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT';

      return `
        <div class="booking-card" data-booking-id="${b.id}" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #38bdf8; letter-spacing: 1px;">
                ${b.bookingCode}
              </span>
              <span style="font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; background: ${st.bg}; color: ${st.color}; font-weight: 700; border: 1px solid ${st.color}44;">
                ${st.label}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-dim);">
              Reservado el: <span style="color: #cbd5e1;">${new Date(b.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.85rem;">
            <div>
              <div style="color: var(--text-dim); font-size: 0.75rem;">HOTEL & DESTINO</div>
              <div style="font-weight: 700; color: #fff; margin-top: 2px;">${b.hotelName}</div>
              <div style="color: #38bdf8; font-size: 0.8rem;">${b.roomName}</div>
            </div>

            <div>
              <div style="color: var(--text-dim); font-size: 0.75rem;">FECHAS DE ESTANCIA</div>
              <div style="color: #fff; margin-top: 2px;">
                📅 <strong>${b.checkIn}</strong> al <strong>${b.checkOut}</strong>
              </div>
              <div style="color: var(--text-dim); font-size: 0.78rem;">${b.nights} noche(s) · ${b.guestsCount} huésped(es)</div>
            </div>

            <div>
              <div style="color: var(--text-dim); font-size: 0.75rem;">TOTAL PAGADO</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin-top: 2px;">
                ${formatCOP(b.totalAmount)}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.65rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem; flex-wrap: wrap;">
            <button class="btn-hotel-secondary btn-download-voucher"
              data-code="${b.bookingCode}"
              data-hotel="${b.hotelName}"
              data-room="${b.roomName}"
              data-checkin="${b.checkIn}"
              data-checkout="${b.checkOut}"
              data-nights="${b.nights}"
              data-guests="${b.guestsCount}"
              data-total="${getCOPPrice(b.totalAmount)}"
              data-currency="${b.currency || 'COP'}"
              style="padding: 6px 14px; font-size: 0.8rem;">
              <span>📄</span> Descargar Voucher PDF (QR)
            </button>

            ${canCancel ? `
              <button class="btn-cancel-booking" data-id="${b.id}" data-code="${b.bookingCode}"
                style="padding: 6px 14px; font-size: 0.8rem; border-radius: 8px; background: rgba(248, 113, 113, 0.15); border: 1px solid rgba(248, 113, 113, 0.35); color: #f87171; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='rgba(248,113,113,0.3)'" onmouseout="this.style.background='rgba(248,113,113,0.15)'">
                <span>❌</span> Cancelar Reserva
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Eventos de botones
    document.querySelectorAll('.btn-download-voucher').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = api.getCurrentUser() || {};
        const voucherData = {
          bookingReference: btn.getAttribute('data-code'),
          userEmail: u.email || 'huesped@travelresorts.com',
          userName: `${u.firstName || 'Huésped'} ${u.lastName || 'VIP'}`.trim(),
          hotelName: btn.getAttribute('data-hotel'),
          hotelAddress: 'Dirección oficial en comprobante',
          hotelCity: 'Colombia',
          roomTypeName: btn.getAttribute('data-room'),
          checkInDate: btn.getAttribute('data-checkin'),
          checkOutDate: btn.getAttribute('data-checkout'),
          nights: parseInt(btn.getAttribute('data-nights'), 10),
          guestsCount: parseInt(btn.getAttribute('data-guests'), 10),
          totalAmount: parseFloat(btn.getAttribute('data-total')),
          currency: btn.getAttribute('data-currency') || 'COP',
          paymentId: `PAY-${Date.now().toString(36).toUpperCase()}`,
          paymentMethod: 'Tarjeta de Crédito Verificada',
        };
        showToast('Generando voucher oficial en PDF con QR...', 'info');
        api.downloadVoucherPdf(voucherData);
      });
    });

    document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const code = btn.getAttribute('data-code');
        if (!confirm(`¿Confirmas que deseas cancelar la reserva ${code}? Se procesará la liberación de fechas.`)) return;

        try {
          showToast(`Cancelando reserva ${code}...`, 'info');
          await api.cancelBooking(id, 'Cancelación voluntaria solicitada por el huésped');
          showToast(`Reserva ${code} cancelada exitosamente`, 'success');
          loadMyBookings();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });
  }

  refreshMyBookingsBtn?.addEventListener('click', () => {
    loadMyBookings();
    showToast('Lista de reservas actualizada', 'info');
  });

  // --------------------------------------------------------------------------
  // 7. PORTAL DE RECEPCIÓN & CHECK-IN (TAB: RECEPCIÓN)
  // --------------------------------------------------------------------------
  async function loadReceptionBookings() {
    if (!receptionTableBody) return;

    receptionTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 2rem;">
          Consultando estancias y llegadas de huéspedes...
        </td>
      </tr>
    `;

    const search = receptionSearchInput?.value.trim() || undefined;

    try {
      const res = await api.getAllBookings({ search, limit: 100 });
      const bookings = res.data || [];
      renderReceptionTable(bookings);
    } catch (err) {
      receptionTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #f87171; padding: 2rem;">
            Error cargando información de recepción: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  function renderReceptionTable(bookings = []) {
    if (!receptionTableBody) return;

    if (bookings.length === 0) {
      receptionTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 2rem;">
            No se encontraron reservas con los criterios buscados.
          </td>
        </tr>
      `;
      return;
    }

    receptionTableBody.innerHTML = bookings.map(b => {
      const st = BOOKING_STATUS_MAP[b.status] || { label: b.status, color: '#fff', bg: 'rgba(255,255,255,0.1)' };

      let actionsHtml = '';
      if (b.status === 'CONFIRMED') {
        actionsHtml = `
          <button class="btn-checkin-action" data-id="${b.id}" data-code="${b.bookingCode}"
            style="padding: 5px 10px; font-size: 0.75rem; border-radius: 6px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; cursor: pointer; font-weight: 700;">
            🛎️ Check-In
          </button>
        `;
      } else if (b.status === 'CHECKED_IN') {
        actionsHtml = `
          <button class="btn-checkout-action" data-id="${b.id}" data-code="${b.bookingCode}"
            style="padding: 5px 10px; font-size: 0.75rem; border-radius: 6px; background: rgba(251, 191, 36, 0.2); border: 1px solid #fbbf24; color: #fbbf24; cursor: pointer; font-weight: 700;">
            🚪 Check-Out
          </button>
        `;
      } else {
        actionsHtml = `<span style="font-size: 0.75rem; color: var(--text-dim);">Sin acciones pendientes</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
          <td style="padding: 0.75rem; font-weight: 800; color: #38bdf8;">${b.bookingCode}</td>
          <td style="padding: 0.75rem;">
            <div style="font-weight: 600; color: #fff;">${b.userName || 'Huésped'}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${b.userEmail}</div>
          </td>
          <td style="padding: 0.75rem;">
            <div style="font-size: 0.85rem; color: #fff;">${b.hotelName}</div>
            <div style="font-size: 0.75rem; color: #cbd5e1;">${b.roomName}</div>
          </td>
          <td style="padding: 0.75rem; font-size: 0.8rem; color: #cbd5e1;">
            <div>In: <strong style="color: #34d399;">${b.checkIn}</strong></div>
            <div>Out: <strong style="color: #f87171;">${b.checkOut}</strong></div>
          </td>
          <td style="padding: 0.75rem;">
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: ${st.bg}; color: ${st.color}; font-weight: 700; border: 1px solid ${st.color}44;">
              ${st.label}
            </span>
          </td>
          <td style="padding: 0.75rem; font-weight: 700; color: #34d399;">
            ${formatCOP(b.totalAmount)}
          </td>
          <td style="padding: 0.75rem;">
            ${actionsHtml}
          </td>
        </tr>
      `;
    }).join('');

    // Eventos de botones de recepción
    document.querySelectorAll('.btn-checkin-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const code = btn.getAttribute('data-code');
        if (!confirm(`¿Registrar entrada (Check-In) del huésped para la reserva ${code}?`)) return;

        try {
          showToast(`Registrando Check-In para ${code}...`, 'info');
          await api.checkInBooking(id);
          showToast(`¡Check-In registrado exitosamente para ${code}!`, 'success');
          loadReceptionBookings();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-checkout-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const code = btn.getAttribute('data-code');
        if (!confirm(`¿Registrar salida (Check-Out) de la habitación para la reserva ${code}?`)) return;

        try {
          showToast(`Registrando Check-Out para ${code}...`, 'info');
          await api.checkOutBooking(id);
          showToast(`¡Check-Out completado con éxito para ${code}!`, 'success');
          loadReceptionBookings();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });
  }

  btnReceptionSearch?.addEventListener('click', loadReceptionBookings);
  receptionSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadReceptionBookings();
  });
  btnReceptionRefresh?.addEventListener('click', () => {
    if (receptionSearchInput) receptionSearchInput.value = '';
    loadReceptionBookings();
    showToast('Listado de llegadas actualizado', 'info');
  });

  // --------------------------------------------------------------------------
  // 15. TAB: GESTIÓN DE CUENTAS & PERSONAL (EXCLUSIVO HOTEL_ADMIN)
  // --------------------------------------------------------------------------
  const ROLE_LABELS = {
    GUEST: { label: 'Cliente / Huésped', color: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
        HOTEL_ADMIN: { label: 'Administrador', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  };

  async function loadUsers() {
    if (!usersTableBody) return;

    usersTableBody.innerHTML = `
      <tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">Consultando cuentas registradas...</td></tr>
    `;

    try {
      const users = await api.getAllUsers();
      renderUsersTable(Array.isArray(users) ? users : (users.data || []));
    } catch (err) {
      usersTableBody.innerHTML = `
        <tr><td colspan="6" style="text-align: center; color: #f87171; padding: 2rem;">Error cargando usuarios: ${err.message}</td></tr>
      `;
    }
  }

  function renderUsersTable(users = []) {
    if (!usersTableBody) return;

    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">No hay cuentas registradas.</td></tr>
      `;
      return;
    }

    usersTableBody.innerHTML = users.map(u => {
      const rl = ROLE_LABELS[u.role] || { label: u.role, color: '#fff', bg: 'rgba(255,255,255,0.1)' };
      const activeBadge = u.isActive
        ? `<span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: rgba(52, 211, 153, 0.15); color: #34d399; font-weight: 700;">Activa</span>`
        : `<span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: rgba(248, 113, 113, 0.15); color: #f87171; font-weight: 700;">Desactivada</span>`;

      let actions = '';
      if (u.role !== 'HOTEL_ADMIN') {
        actions += `
          <button class="btn-user-toggle" data-id="${u.id}" data-active="${u.isActive}"
            style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 700;
              background: rgba(251, 191, 36, 0.15); border: 1px solid #fbbf24; color: #fbbf24;">
            ${u.isActive ? '🔒 Desactivar' : '🔓 Activar'}
          </button>
        `;
      }
      if (u.role === 'GUEST') {
        actions += `
          <button class="btn-user-delete" data-id="${u.id}" data-email="${u.email}"
            style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 700;
              background: rgba(248, 113, 113, 0.15); border: 1px solid #f87171; color: #f87171;">
            🗑️ Eliminar
          </button>
        `;
      }

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
          <td style="padding: 0.75rem;">
            <div style="font-weight: 600; color: #fff;">${u.firstName} ${u.lastName}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">ID: ${u.id?.substring(0, 8)}…</div>
          </td>
          <td style="padding: 0.75rem; font-size: 0.82rem; color: #cbd5e1;">${u.email}</td>
          <td style="padding: 0.75rem;">
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: ${rl.bg}; color: ${rl.color}; font-weight: 700; border: 1px solid ${rl.color}44;">
              ${rl.label}
            </span>
          </td>
          <td style="padding: 0.75rem;">${activeBadge}</td>
          <td style="padding: 0.75rem; font-size: 0.75rem; color: var(--text-dim);">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
          <td style="padding: 0.75rem;">
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">${actions || '<span style="font-size: 0.72rem; color: var(--text-dim);">Cuenta protegida</span>'}</div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-user-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const isActive = btn.getAttribute('data-active') === 'true';
        try {
          await api.setUserStatus(id, !isActive);
          showToast(`Cuenta ${isActive ? 'desactivada' : 'activada'} correctamente`, 'success');
          loadUsers();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-user-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const email = btn.getAttribute('data-email');
        if (!confirm(`¿Eliminar definitivamente la cuenta ${email}? Esta acción libera el correo para futuros registros.`)) return;
        try {
          await api.deleteUser(id);
          showToast(`Cuenta ${email} eliminada`, 'success');
          loadUsers();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });
  }

  createStaffForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const staffData = {
      firstName: document.getElementById('staffFirstName').value.trim(),
      lastName: document.getElementById('staffLastName').value.trim(),
      email: document.getElementById('staffEmail').value.trim(),
      password: document.getElementById('staffPassword').value,
      role: document.getElementById('staffRole').value,
    };

    if (submitStaffBtn) submitStaffBtn.disabled = true;
    if (submitStaffBtn) submitStaffBtn.innerHTML = '<span>Creando cuenta...</span>';

    try {
      const res = await api.createStaff(staffData);
      showToast(`✅ Cuenta ${res.user?.role} creada para ${res.user?.email}`, 'success');
      createStaffForm.reset();
      loadUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      if (submitStaffBtn) {
        submitStaffBtn.disabled = false;
        submitStaffBtn.innerHTML = '<span>CREAR CUENTA</span>';
      }
    }
  });

  refreshUsersBtn?.addEventListener('click', () => {
    loadUsers();
    showToast('Listado de cuentas actualizado', 'info');
  });

  // Botón para eliminar en masa todas las cuentas GUEST de prueba
  const btnDeleteGuests = document.getElementById('btnDeleteGuests');
  btnDeleteGuests?.addEventListener('click', async () => {
    if (!confirm('¿Confirmas que deseas eliminar TODOS los usuarios con rol GUEST?\n\nEsta acción liberará sus correos para nuevas pruebas y registros limpios.')) return;
    try {
      showToast('Eliminando usuarios GUEST...', 'info');
      const res = await api.deleteGuests();
      showToast(res.message || `${res.deletedCount ?? 0} usuarios GUEST eliminados exitosamente`, 'success');
      loadUsers();
    } catch (err) {
      showToast(`Error al purgar huéspedes: ${err.message}`, 'error');
    }
  });

  // --------------------------------------------------------------------------
  // 16. TAB: PAGOS & REEMBOLSOS (EXCLUSIVO HOTEL_ADMIN)
  // --------------------------------------------------------------------------
  const PAYMENT_STATUS_MAP = {
    COMPLETED: { label: 'Completado', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
    PENDING: { label: 'Pendiente', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
    FAILED: { label: 'Fallido', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
    REFUNDED: { label: 'Reembolsado', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  };

  async function loadPayments() {
    if (!paymentsTableBody) return;

    paymentsTableBody.innerHTML = `
      <tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 2rem;">Consultando transacciones...</td></tr>
    `;

    try {
      const res = await api.getAllPayments({ limit: 100 });
      renderPaymentsTable(res.data || []);
    } catch (err) {
      paymentsTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; color: #f87171; padding: 2rem;">Error cargando pagos: ${err.message}</td></tr>
      `;
    }
  }

  function renderPaymentsTable(payments = []) {
    if (!paymentsTableBody) return;

    if (payments.length === 0) {
      paymentsTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 2rem;">No hay transacciones registradas.</td></tr>
      `;
      return;
    }

    paymentsTableBody.innerHTML = payments.map(p => {
      const st = PAYMENT_STATUS_MAP[p.status] || { label: p.status, color: '#fff', bg: 'rgba(255,255,255,0.1)' };
      const canRefund = p.status === 'COMPLETED';

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
          <td style="padding: 0.75rem; font-weight: 800; color: #38bdf8;">${p.paymentReference || p.reference || p.id?.substring(0, 8)}</td>
          <td style="padding: 0.75rem; font-size: 0.8rem; color: #cbd5e1;">${p.bookingCode || p.bookingId || '—'}</td>
          <td style="padding: 0.75rem; font-size: 0.8rem; color: #cbd5e1;">${p.method || p.paymentMethod || '—'}</td>
          <td style="padding: 0.75rem; font-weight: 700; color: #34d399;">
            ${formatCOP(p.amount || p.totalAmount || 0)}
          </td>
          <td style="padding: 0.75rem;">
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: ${st.bg}; color: ${st.color}; font-weight: 700; border: 1px solid ${st.color}44;">
              ${st.label}
            </span>
          </td>
          <td style="padding: 0.75rem; font-size: 0.75rem; color: var(--text-dim);">${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
          <td style="padding: 0.75rem;">
            ${canRefund
              ? `<button class="btn-refund-action" data-ref="${p.paymentReference || p.reference || p.id}"
                  style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 700;
                    background: rgba(167, 139, 250, 0.15); border: 1px solid #a78bfa; color: #a78bfa;">
                  ↩️ Reembolsar
                </button>`
              : '<span style="font-size: 0.72rem; color: var(--text-dim);">—</span>'}
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-refund-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ref = btn.getAttribute('data-ref');
        const reason = prompt(`Motivo del reembolso para la transacción ${ref}:`);
        if (reason === null) return;
        try {
          showToast(`Procesando reembolso de ${ref}...`, 'info');
          await api.refundPayment(ref, reason);
          showToast(`✅ Reembolso procesado para ${ref}`, 'success');
          loadPayments();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });
  }

  refreshPaymentsBtn?.addEventListener('click', () => {
    loadPayments();
    showToast('Transacciones actualizadas', 'info');
  });

  // --------------------------------------------------------------------------
  // 17. TAB: NOTIFICACIONES & VOUCHERS (notification-service:3008)
  // --------------------------------------------------------------------------
  const notificationsHistoryList = document.getElementById('notificationsHistoryList');
  const notifCountBadge = document.getElementById('notifCountBadge');
  const refreshNotifHistoryBtn = document.getElementById('refreshNotifHistoryBtn');

  const btnVoucherSample = document.getElementById('btnVoucherSample');
  const btnTriggerWelcome = document.getElementById('btnTriggerWelcome');
  const btnTriggerBookingConfirm = document.getElementById('btnTriggerBookingConfirm');
  const btnTriggerPaymentFailed = document.getElementById('btnTriggerPaymentFailed');
  const btnTriggerCheckinReminder = document.getElementById('btnTriggerCheckinReminder');
  const btnTriggerRefund = document.getElementById('btnTriggerRefund');

  async function loadNotificationHistory() {
    try {
      const history = await api.getNotificationHistory();
      const currentUser = api.getCurrentUser();
      const role = currentUser ? (currentUser.role || 'GUEST') : 'GUEST';
      const isStaff = role === 'HOTEL_ADMIN';

      // Actualizar píldora de estado de SMTP (Gmail / Ethereal)
      api.getNotificationStatus().then(st => {
        const textElem = document.getElementById('notifSmtpPillText');
        const pillElem = document.getElementById('notifSmtpPill');
        if (textElem && st?.smtp) {
          if (st.smtp.isReal) {
            textElem.textContent = st.smtp.provider || 'Gmail SMTP (Producción)';
            if (pillElem) pillElem.style.borderColor = '#22c55e';
          } else {
            textElem.textContent = 'Nodemailer (Ethereal Dev)';
          }
        }
      }).catch(() => {});

      // GUEST solo ve sus propias notificaciones; el personal ve todo el registro
      let filteredHistory = Array.isArray(history) ? history : (history?.data || []);
      if (!isStaff && currentUser && currentUser.email) {
        filteredHistory = filteredHistory.filter(item => {
          const recipient = (item.recipient || item.recipientEmail || item.email || '').toLowerCase();
          return recipient === currentUser.email.toLowerCase();
        });
      }
      renderNotificationHistory(filteredHistory);
    } catch (err) {
      console.warn('No se pudo cargar el historial de notificaciones:', err);
    }
  }

  function renderNotificationHistory(history = []) {
    if (!notificationsHistoryList) return;

    if (notifCountBadge) {
      notifCountBadge.textContent = `${history.length} notificación(es)`;
    }

    if (!history || history.length === 0) {
      const user = api.getCurrentUser();
      const isStaff = user && user.role === 'HOTEL_ADMIN';
      notificationsHistoryList.innerHTML = `
        <div class="notif-history-empty">
          ${isStaff
            ? 'No se han procesado notificaciones en esta sesión. Utiliza los botones de arriba para disparar eventos hacia RabbitMQ.'
            : 'No tienes notificaciones registradas en tu buzón personal por el momento.'}
        </div>
      `;
      return;
    }

    notificationsHistoryList.innerHTML = history.map(item => {
      const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '—';
      const deliveryBadge = item.status === 'SENT' && !item.previewUrl
        ? `<span style="color:#34d399; font-size: 0.72rem; font-weight:600;">✓ Entregado a Gmail</span>`
        : '';
      const previewLink = item.previewUrl
        ? `<a href="${item.previewUrl}" target="_blank" class="notif-link-btn" title="Abrir correo renderizado en Ethereal">🔗 Ver Email</a>`
        : deliveryBadge;
      const attachmentBadge = item.hasAttachment
        ? `<span style="color:#6ee7b7; font-size: 0.72rem;">📎 Voucher PDF</span>`
        : '';

      return `
        <div class="notif-history-item">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="notif-badge-tag ${item.type || ''}">${item.type || 'EVENT'}</span>
            <strong style="color: #f8fafc;">${item.recipient || '—'}</strong>
            <span style="color: var(--text-dim); font-size: 0.75rem;">${item.subject || ''}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-left: auto;">
            <span style="color: var(--text-dim); font-size: 0.7rem;">${timeStr} (${item.durationMs ?? 0}ms)</span>
            ${attachmentBadge}
            ${previewLink}
          </div>
        </div>
      `;
    }).join('');
  }

  // Triggers de notificación
  const btnVoucherSampleHeader = document.getElementById('btnVoucherSampleHeader');
  btnVoucherSampleHeader?.addEventListener('click', () => {
    const url = api.getVoucherSampleUrl();
    window.open(url, '_blank');
    showToast('Generando y transmitiendo Voucher PDF con QR para lectura en recepción...', 'success');
  });

  btnVoucherSample?.addEventListener('click', () => {
    const url = api.getVoucherSampleUrl();
    window.open(url, '_blank');
    showToast('Generando y transmitiendo Voucher PDF con QR para lectura en recepción...', 'success');
  });

  btnTriggerWelcome?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || { firstName: 'Mauricio', lastName: 'Gómez', email: 'mauromedina2508@gmail.com' };
    try {
      showToast(`Despachando evento user.registered a ${user.email}...`, 'info');
      await api.sendWelcomeNotification({
        userId: user.id || 'usr_demo_100',
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        loginUrl: window.location.origin,
      });
      showToast('Correo de bienvenida despachado exitosamente ✓', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  btnTriggerBookingConfirm?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || { firstName: 'Mauricio', lastName: 'Gómez', email: 'mauromedina2508@gmail.com' };
    const ref = `TR-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    try {
      showToast(`Generando Voucher PDF y despachando confirmación a ${user.email}...`, 'info');
      await api.sendBookingConfirmationNotification({
        bookingId: `bkg_${Date.now()}_sim`,
        bookingReference: ref,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        hotelName: 'The Grand Riviera Luxury Palace',
        hotelAddress: 'Av. Costanera Km 14',
        hotelCity: 'Cancún, México',
        roomTypeName: 'Master Oceanfront Suite con Balcón',
        checkInDate: '2026-11-20',
        checkOutDate: '2026-11-25',
        nights: 5,
        guestsCount: 2,
        totalAmount: 3800000,
        currency: 'COP',
        paymentId: `pi_stripe_${Date.now().toString(36)}`,
        paymentMethod: 'Tarjeta Visa terminada en 4242',
      });
      showToast(`¡Voucher PDF emitido y correo despachado para ${ref}! ✓`, 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  btnTriggerPaymentFailed?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || { firstName: 'Mauricio', lastName: 'Gómez', email: 'mauromedina2508@gmail.com' };
    try {
      showToast('Despachando alerta payment.failed...', 'info');
      await api.sendPaymentFailedNotification({
        bookingId: `bkg_pend_${Math.random().toString(36).substring(2, 7)}`,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        hotelName: 'Cartagena Paradise Beach Resort',
        roomTypeName: 'Junior Suite Vista al Mar',
        totalAmount: 1920000,
        currency: 'COP',
        failureReason: 'Fondos insuficientes (card_declined) reportados por la pasarela',
        retryPaymentUrl: `${window.location.origin}`,
        expiresAt: 'Restan 8 minutos de reserva en Redis',
      });
      showToast('Alerta de pago fallido despachada con éxito ✓', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  btnTriggerCheckinReminder?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || { firstName: 'Mauricio', lastName: 'Gómez', email: 'mauromedina2508@gmail.com' };
    try {
      showToast('Despachando recordatorio de check-in 24h...', 'info');
      await api.sendCheckinReminderNotification({
        bookingId: `bkg_chk_${Date.now().toString(36)}`,
        bookingReference: 'TR-2026-REMINDER',
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        hotelName: 'The Palm Luxury Suites & Spa',
        hotelAddress: 'Calle 50 # 12-40, Bocagrande',
        hotelCity: 'Cartagena de Indias',
        roomTypeName: 'Penthouse Imperial con Jacuzzi',
        checkInDate: 'Mañana',
        checkInTime: '15:00',
        specialInstructions: 'Recepción VIP con copa de champagne de bienvenida.',
      });
      showToast('Recordatorio de check-in enviado exitosamente ✓', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  btnTriggerRefund?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || { firstName: 'Mauricio', lastName: 'Gómez', email: 'mauromedina2508@gmail.com' };
    try {
      showToast('Despachando comprobante de reembolso...', 'info');
      await api.sendRefundReceiptNotification({
        bookingId: `bkg_canc_${Date.now().toString(36)}`,
        bookingReference: 'TR-2026-REFUND',
        refundId: `ref_stripe_${Math.random().toString(36).substring(2, 9)}`,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        hotelName: 'The Grand Riviera Luxury Palace',
        roomTypeName: 'Master Oceanfront Suite',
        refundAmount: 3800000,
        originalAmount: 3800000,
        currency: 'COP',
        reason: 'Cancelación voluntaria del huésped con anticipación mayor a 48h.',
      });
      showToast('Comprobante de reembolso despachado exitosamente ✓', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  refreshNotifHistoryBtn?.addEventListener('click', () => {
    loadNotificationHistory();
    showToast('Historial de notificaciones actualizado', 'info');
  });

  // --------------------------------------------------------------------------
  // 8. CATÁLOGO DE HABITACIONES (TAB: HABITACIONES)
  // --------------------------------------------------------------------------
  async function loadRoomHotels() {
    try {
      const res = await api.getHotels({ limit: 100 });
      const hotels = res.data || [];
      const cur = filterRoomHotel?.value || '';

      if (filterRoomHotel) {
        filterRoomHotel.innerHTML = '<option value="">Todos los Hoteles</option>' +
          hotels.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
        filterRoomHotel.value = cur;
      }

      const formHotel = document.getElementById('formRoomHotel');
      if (formHotel) {
        formHotel.innerHTML = hotels
          .map(h => `<option value="${h.id}" data-slug="${h.slug}" data-name="${h.name}">${h.name} — ${h.city}</option>`)
          .join('');
      }
    } catch (err) {
      console.warn('Error cargando hoteles para filtro de habitaciones:', err);
    }
  }

  async function loadRooms() {
    if (!roomsGrid) return;

    const filters = {
      search: filterRoomSearch?.value.trim() || undefined,
      hotelId: filterRoomHotel?.value || undefined,
      roomType: filterRoomType?.value || undefined,
      limit: 100,
    };

    try {
      const res = await api.getRooms(filters);
      renderRooms(res.data || []);
    } catch (err) {
      roomsGrid.innerHTML = `
        <div class="empty-hotels-box">
          <span style="color: #f87171;">Error al consultar habitaciones: ${err.message}</span>
        </div>
      `;
    }
  }

  function renderRooms(rooms = []) {
    if (!roomsGrid) return;

    if (rooms.length === 0) {
      roomsGrid.innerHTML = `
        <div class="empty-hotels-box">
          <span>No se encontraron habitaciones con los criterios seleccionados.</span>
        </div>
      `;
      return;
    }

    const currentUser = api.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'HOTEL_ADMIN';
    const isStaff = currentUser && currentUser.role === 'HOTEL_ADMIN';

    roomsGrid.innerHTML = rooms.map(r => {
      const img = (Array.isArray(r.images) && r.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';
      const typeLabel = ROOM_TYPE_NAMES[r.roomType] || r.roomType;
      const amenities = (r.amenities || []).slice(0, 3).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('');

      // Botón de dar de baja: Exclusivo de HOTEL_ADMIN
      const adminButtons = isAdmin ? `
        <div class="hotel-admin-actions">
          <button class="btn-card-delete btn-room-delete" data-id="${r.id}" data-name="${r.name}" title="Dar de baja habitación">🗑️</button>
        </div>
      ` : '';

      // Selector de estado operativo: Disponible exclusivamente para HOTEL_ADMIN
      // Para Huéspedes (GUEST): Solo lectura estática de disponibilidad
      const statusControl = isStaff ? `
        <div style="display:flex; align-items:center; gap:0.35rem;">
          <span style="font-size:0.7rem; color:var(--text-dim);">Estado:</span>
          <select class="room-status-select" data-id="${r.id}" style="padding: 3px 6px; font-size: 0.72rem; border-radius: 6px; background: rgba(15,23,42,0.85); color: #fff; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">
            <option value="AVAILABLE" ${r.status === 'AVAILABLE' ? 'selected' : ''}>🟢 Disponible</option>
            <option value="OCCUPIED" ${r.status === 'OCCUPIED' ? 'selected' : ''}>🔴 Ocupada</option>
            <option value="MAINTENANCE" ${r.status === 'MAINTENANCE' ? 'selected' : ''}>🟠 Mantenimiento</option>
            <option value="INACTIVE" ${r.status === 'INACTIVE' ? 'selected' : ''}>⚫ Inactiva</option>
          </select>
        </div>
      ` : `
        <span style="font-size: 0.75rem; font-weight: 700; color: ${r.status === 'AVAILABLE' ? '#34d399' : '#f87171'};">
          ${r.status === 'AVAILABLE' ? '🟢 Disponible' : '🔴 Ocupada'}
        </span>
      `;

      return `
        <div class="hotel-card" data-id="${r.id}">
          <div class="hotel-card-media">
            <img src="${img}" alt="${r.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-stars">${typeLabel}</div>
            <div class="badge-city">#${r.roomNumber} · Piso ${r.floor}</div>
            ${adminButtons}
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${r.name}</h3>
            <div class="hotel-card-location">🏨 ${r.hotelName}</div>
            <p class="hotel-card-desc">${r.description ? r.description.substring(0, 100) + '...' : ''}</p>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin: 0.4rem 0;">
              👥 ${r.maxAdults} adultos · 🛏️ ${r.bedType} · 📐 ${r.sizeSqm} m² · 🌅 ${r.viewType}
            </div>
            <div class="hotel-amenities-tags">${amenities}</div>
          </div>
          <div class="hotel-card-footer">
            <div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #fff;">
                ${formatCOP(r.pricePerNight)} <span style="font-size: 0.7rem; font-weight: 400; color: var(--text-dim);">/ noche</span>
              </div>
            </div>
            ${statusControl}
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <button class="btn-hotel-secondary btn-open-calendar"
                data-room-id="${r.id}"
                data-room-name="${r.name} #${r.roomNumber}"
                data-hotel-name="${r.hotelName}"
                data-hotel-id="${r.hotelId}"
                data-price="${getCOPPrice(r.pricePerNight)}"
                data-max-adults="${r.maxAdults || 2}"
                style="padding: 6px 10px; font-size: 0.75rem;" title="Consultar calendario mensual de fechas y reservar">
                📅 Calendario & Reserva
              </button>
              <button class="btn-blue btn-book-from-rooms" data-hotel-id="${r.hotelId}" style="padding: 6px 12px; font-size: 0.75rem;">
                Reservar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Listener para abrir el calendario de fechas de la habitación
    document.querySelectorAll('.btn-open-calendar').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = btn.getAttribute('data-room-id');
        const roomName = btn.getAttribute('data-room-name');
        const hotelName = btn.getAttribute('data-hotel-name');
        const hotelId = btn.getAttribute('data-hotel-id');
        const price = getCOPPrice(btn.getAttribute('data-price') || 450000);
        const maxAdults = Number(btn.getAttribute('data-max-adults') || 2);
        openRoomCalendarModal(roomId, roomName, hotelName, hotelId, price, maxAdults);
      });
    });

    // Listener para cambio de estado operativo (Staff)
    document.querySelectorAll('.room-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        try {
          await api.updateRoomStatus(id, newStatus);
          showToast('Estado de la habitación actualizado en tiempo real', 'success');
        } catch (err) {
          showToast(`Error al actualizar estado: ${err.message}`, 'error');
          loadRooms();
        }
      });
    });

    document.querySelectorAll('.btn-book-from-rooms').forEach(btn => {
      btn.addEventListener('click', () => {
        const hotelId = btn.getAttribute('data-hotel-id');
        openAvailabilityForHotel(hotelId);
      });
    });

    document.querySelectorAll('.btn-room-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (!confirm(`¿Dar de baja la habitación "${name}"?`)) return;

        try {
          await api.deleteRoom(id);
          showToast(`Habitación "${name}" eliminada`, 'info');
          loadRooms();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  }

  openCreateRoomBtn?.addEventListener('click', async () => {
    await loadRoomHotels();
    roomUpsertForm.reset();
    roomFormModal.style.display = 'flex';
  });

  const btnSeedRooms = document.getElementById('btnSeedRooms');
  btnSeedRooms?.addEventListener('click', async () => {
    if (!confirm('¿Deseas poblar el inventario con las habitaciones y suites oficiales de demostración?')) return;
    try {
      showToast('Sembrando inventario de habitaciones demo...', 'info');
      await api.seedRooms();
      showToast('¡Habitaciones demo sembradas exitosamente!', 'success');
      loadRooms();
    } catch (err) {
      showToast(`Error al sembrar habitaciones: ${err.message}`, 'error');
    }
  });

  closeRoomModalBtn?.addEventListener('click', () => roomFormModal.style.display = 'none');
  roomFormModal?.addEventListener('click', (e) => { if (e.target === roomFormModal) roomFormModal.style.display = 'none'; });

  roomUpsertForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitRoomFormBtn.disabled = true;
    submitRoomFormBtn.innerHTML = '<span>Guardando habitación...</span>';

    const hotelSel = document.getElementById('formRoomHotel');
    const opt = hotelSel.options[hotelSel.selectedIndex];
    const amenitiesRaw = document.getElementById('formRoomAmenities')?.value || '';
    const imgRaw = document.getElementById('formRoomImg').value.trim();

    const payload = {
      hotelId: hotelSel.value,
      hotelSlug: opt?.getAttribute('data-slug') || undefined,
      hotelName: opt?.getAttribute('data-name') || undefined,
      roomNumber: document.getElementById('formRoomNumber').value.trim(),
      floor: parseInt(document.getElementById('formRoomFloor').value, 10) || 1,
      roomType: document.getElementById('formRoomTypeSel').value,
      name: document.getElementById('formRoomName').value.trim(),
      description: document.getElementById('formRoomDesc').value.trim(),
      pricePerNight: parseFloat(document.getElementById('formRoomPrice').value),
      maxAdults: parseInt(document.getElementById('formRoomAdults').value, 10) || 2,
      maxChildren: parseInt(document.getElementById('formRoomChildren').value, 10) || 0,
      bedType: '1 Cama King',
      sizeSqm: 38,
      viewType: 'Vista al Mar',
      amenities: amenitiesRaw ? amenitiesRaw.split(',').map(a => a.trim()).filter(Boolean) : ['Jacuzzi', 'Balcón', 'Smart TV'],
      images: imgRaw ? [imgRaw] : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'],
      breakfastIncluded: true,
    };

    try {
      await api.createRoom(payload);
      showToast('Habitación registrada exitosamente', 'success');
      roomFormModal.style.display = 'none';
      loadRooms();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitRoomFormBtn.disabled = false;
      submitRoomFormBtn.innerHTML = '<span>GUARDAR HABITACIÓN</span>';
    }
  });

  refreshRoomsBtn?.addEventListener('click', () => {
    loadRooms();
    showToast('Inventario de habitaciones actualizado', 'info');
  });

  let roomFilterTimer = null;
  filterRoomSearch?.addEventListener('input', () => {
    clearTimeout(roomFilterTimer);
    roomFilterTimer = setTimeout(loadRooms, 350);
  });
  filterRoomHotel?.addEventListener('change', loadRooms);
  filterRoomType?.addEventListener('change', loadRooms);

  // --------------------------------------------------------------------------
  // 9. CONTROLADOR DEL CALENDARIO DE DISPONIBILIDAD & RESERVA DE FECHAS
  // --------------------------------------------------------------------------
  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  function updateCalendarBookingPanel() {
    if (calClientCheckInText) {
      calClientCheckInText.textContent = calBookingCheckIn || 'Selecciona en calendario';
      calClientCheckInText.style.color = calBookingCheckIn ? '#34d399' : 'var(--text-dim)';
    }
    if (calClientCheckOutText) {
      calClientCheckOutText.textContent = calBookingCheckOut || 'Selecciona en calendario';
      calClientCheckOutText.style.color = calBookingCheckOut ? '#38bdf8' : 'var(--text-dim)';
    }

    if (calBookingCheckIn && calBookingCheckOut) {
      const dIn = new Date(calBookingCheckIn);
      const dOut = new Date(calBookingCheckOut);
      const diffTime = dOut.getTime() - dIn.getTime();
      const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      const total = nights * calSelectedRoomPrice;

      if (calClientNightsText) {
        calClientNightsText.textContent = `${nights} ${nights === 1 ? 'noche' : 'noches'}`;
      }
      if (calClientTotalText) {
        calClientTotalText.textContent = formatCOP(total);
      }
      if (btnProceedBookingFromCalendar) {
        btnProceedBookingFromCalendar.disabled = false;
        btnProceedBookingFromCalendar.style.opacity = '1';
        btnProceedBookingFromCalendar.style.cursor = 'pointer';
        btnProceedBookingFromCalendar.innerHTML = `<span>✨ RESERVAR HABITACIÓN (${nights} ${nights === 1 ? 'NOCHE' : 'NOCHES'} — ${formatCOP(total)})</span>`;
      }
    } else if (calBookingCheckIn && !calBookingCheckOut) {
      if (calClientNightsText) calClientNightsText.textContent = 'Elige salida';
      if (calClientTotalText) calClientTotalText.textContent = `${formatCOP(calSelectedRoomPrice)} / noche`;
      if (btnProceedBookingFromCalendar) {
        btnProceedBookingFromCalendar.disabled = true;
        btnProceedBookingFromCalendar.style.opacity = '0.6';
        btnProceedBookingFromCalendar.style.cursor = 'not-allowed';
        btnProceedBookingFromCalendar.innerHTML = `<span>👈 SELECCIONA EL DÍA DE SALIDA EN EL CALENDARIO</span>`;
      }
    } else {
      if (calClientNightsText) calClientNightsText.textContent = '—';
      if (calClientTotalText) calClientTotalText.textContent = `${formatCOP(calSelectedRoomPrice)} / noche`;
      if (btnProceedBookingFromCalendar) {
        btnProceedBookingFromCalendar.disabled = true;
        btnProceedBookingFromCalendar.style.opacity = '0.6';
        btnProceedBookingFromCalendar.style.cursor = 'not-allowed';
        btnProceedBookingFromCalendar.innerHTML = `<span>👈 SELECCIONA FECHA DE LLEGADA EN EL CALENDARIO</span>`;
      }
    }
  }

  async function openRoomCalendarModal(roomId, roomName, hotelName, hotelId, price, maxAdults) {
    calSelectedRoomId = roomId;
    calSelectedRoomName = roomName;
    calSelectedHotelName = hotelName;
    calSelectedHotelId = hotelId;
    calSelectedRoomPrice = getCOPPrice(price || 450000);
    calSelectedRoomMaxAdults = Number(maxAdults) || 2;

    calCurrentYear = 2026;
    calCurrentMonth = 11; // Noviembre 2026

    // Rango de fechas por defecto
    calBookingCheckIn = '2026-11-20';
    calBookingCheckOut = '2026-11-22';
    calSelectionStep = 0;

    if (calRoomTitle) calRoomTitle.textContent = `${roomName} · ${formatCOP(calSelectedRoomPrice)} / noche`;
    if (calHotelTitle) calHotelTitle.textContent = hotelName;
    if (adminCalRoomId) adminCalRoomId.value = roomId;
    if (adminCalHotelId) adminCalHotelId.value = hotelId;

    // Poblar dropdown de huéspedes según capacidad de la habitación
    if (calClientGuestsSel) {
      const max = Math.max(1, calSelectedRoomMaxAdults);
      calClientGuestsSel.innerHTML = Array.from({ length: max }, (_, i) => i + 1)
        .map(n => `<option value="${n}" ${n === Math.min(2, max) ? 'selected' : ''}>${n}</option>`)
        .join('');
    }

    // Controles de Administrador
    const user = api.getCurrentUser();
    const isAdmin = user && user.role === 'HOTEL_ADMIN';
    if (adminDateControls) {
      adminDateControls.style.display = isAdmin ? 'block' : 'none';
    }
    if (adminBlockStart) adminBlockStart.value = '2026-11-20';
    if (adminBlockEnd) adminBlockEnd.value = '2026-11-25';

    // Panel de selección para el cliente/huésped
    if (clientBookingControls) {
      clientBookingControls.style.display = 'block';
    }

    updateCalendarBookingPanel();

    await loadAndRenderCalendar(calSelectedRoomId, calCurrentYear, calCurrentMonth);
    if (roomCalendarModal) roomCalendarModal.style.display = 'flex';
  }

  async function loadAndRenderCalendar(roomId, year, month) {
    if (calCurrentMonthLabel) {
      calCurrentMonthLabel.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
    }

    if (!calDaysGrid) return;
    calDaysGrid.innerHTML = '<div style="grid-column: span 7; color: var(--text-dim); padding: 1.5rem;">Cargando ocupación de fechas...</div>';

    try {
      const data = await api.getRoomCalendar(roomId, year, month);
      const calendarDays = data?.calendar || [];

      // Días de la semana
      const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      let html = weekdays.map(w => `
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-dim); padding: 4px;">${w}</div>
      `).join('');

      // Desplazamiento del primer día del mes (1 = Lun, 7 = Dom)
      const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 es Dom
      const offset = (firstDayOfWeek === 0 ? 7 : firstDayOfWeek) - 1; // 0..6
      for (let i = 0; i < offset; i++) {
        html += '<div style="opacity: 0;"></div>';
      }

      // Estilos según el estado
      const STATUS_STYLES = {
        AVAILABLE: {
          bg: 'rgba(52, 211, 153, 0.12)',
          border: 'rgba(52, 211, 153, 0.35)',
          color: '#34d399',
          label: 'Libre',
        },
        HOLD: {
          bg: 'rgba(251, 191, 36, 0.15)',
          border: 'rgba(251, 191, 36, 0.45)',
          color: '#fbbf24',
          label: 'Hold 10m',
        },
        BOOKED: {
          bg: 'rgba(248, 113, 113, 0.18)',
          border: 'rgba(248, 113, 113, 0.45)',
          color: '#f87171',
          label: 'Reservada',
        },
        BLOCKED: {
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.35)',
          color: '#cbd5e1',
          label: 'Bloqueo Admin',
        },
      };

      calendarDays.forEach(d => {
        const st = STATUS_STYLES[d.status] || STATUS_STYLES.AVAILABLE;
        const isAvailable = d.status === 'AVAILABLE';

        const isCheckIn = calBookingCheckIn === d.date;
        const isCheckOut = calBookingCheckOut === d.date;
        const isInRange = calBookingCheckIn && calBookingCheckOut && d.date > calBookingCheckIn && d.date < calBookingCheckOut;

        let cellBg = st.bg;
        let cellBorder = st.border;
        let badgeHtml = `<span style="font-size: 0.65rem; font-weight: 600; color: ${st.color}; margin-top: 2px;">${st.label}</span>`;
        let extraStyle = '';

        if (isCheckIn) {
          cellBg = 'rgba(52, 211, 153, 0.35)';
          cellBorder = '#34d399';
          badgeHtml = `<span style="font-size: 0.62rem; font-weight: 800; color: #fff; background: #059669; padding: 1px 6px; border-radius: 4px; margin-top: 2px;">Llegada 🟢</span>`;
          extraStyle = 'box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); transform: scale(1.02);';
        } else if (isCheckOut) {
          cellBg = 'rgba(56, 189, 248, 0.35)';
          cellBorder = '#38bdf8';
          badgeHtml = `<span style="font-size: 0.62rem; font-weight: 800; color: #fff; background: #0284c7; padding: 1px 6px; border-radius: 4px; margin-top: 2px;">Salida 🔵</span>`;
          extraStyle = 'box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); transform: scale(1.02);';
        } else if (isInRange) {
          cellBg = 'rgba(56, 189, 248, 0.18)';
          cellBorder = 'rgba(56, 189, 248, 0.4)';
          badgeHtml = `<span style="font-size: 0.62rem; font-weight: 600; color: #7dd3fc; margin-top: 2px;">Estancia</span>`;
        }

        const refInfo = d.details?.ref ? `<div style="font-size: 0.58rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.details.ref}</div>` : '';

        html += `
          <div class="cal-day-cell" data-date="${d.date}" data-status="${d.status}"
            style="background: ${cellBg}; border: 2px solid ${cellBorder}; border-radius: 8px; padding: 6px 2px; min-height: 52px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; transition: all 0.2s; ${extraStyle}"
            title="${d.date}: ${st.label}${isCheckIn ? ' (Llegada)' : ''}${isCheckOut ? ' (Salida)' : ''}"
            onmouseover="if('${isAvailable}' === 'true') this.style.transform='scale(1.05)'" onmouseout="if('${isCheckIn || isCheckOut}' !== 'true') this.style.transform='scale(1)'">
            <span style="font-weight: 800; font-size: 0.82rem; color: #fff;">${d.day}</span>
            ${badgeHtml}
            ${refInfo}
          </div>
        `;
      });

      calDaysGrid.innerHTML = html;

      // Event listener al hacer clic en un día del calendario
      document.querySelectorAll('.cal-day-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const selectedDate = cell.getAttribute('data-date');
          const status = cell.getAttribute('data-status');
          const user = api.getCurrentUser();
          const isAdmin = user && user.role === 'HOTEL_ADMIN';

          // Para HOTEL_ADMIN: pre-cargar en formulario administrativo de bloqueo
          if (isAdmin) {
            if (adminBlockStart) adminBlockStart.value = selectedDate;
            if (adminBlockEnd) {
              const nextD = new Date(selectedDate);
              nextD.setDate(nextD.getDate() + 2);
              adminBlockEnd.value = nextD.toISOString().split('T')[0];
            }
          }

          // Validación para clientes: solo fechas disponibles pueden seleccionarse para reservar
          if (status !== 'AVAILABLE') {
            const stLabel = status === 'BOOKED' ? 'Reservada por otro huésped' : (status === 'HOLD' ? 'Bloqueada temporalmente (Hold 10m)' : 'Bloqueo administrativo');
            showToast(`La fecha ${selectedDate} no está disponible (${stLabel}). Selecciona una fecha libre en verde.`, 'warning');
            return;
          }

          // Lógica de selección de estancia (Check-In -> Check-Out)
          if (!calBookingCheckIn || calSelectionStep === 0) {
            calBookingCheckIn = selectedDate;
            calBookingCheckOut = null;
            calSelectionStep = 1;
            showToast(`📅 Check-In: ${selectedDate}. Ahora haz clic en tu fecha de salida (Check-Out).`, 'info');
          } else if (calSelectionStep === 1) {
            if (selectedDate <= calBookingCheckIn) {
              calBookingCheckIn = selectedDate;
              calBookingCheckOut = null;
              calSelectionStep = 1;
              showToast(`📅 Nueva fecha de Check-In: ${selectedDate}. Selecciona tu fecha de salida.`, 'info');
            } else {
              const hasUnavailable = calendarDays.some(cd =>
                cd.date >= calBookingCheckIn && cd.date < selectedDate && cd.status !== 'AVAILABLE'
              );
              if (hasUnavailable) {
                showToast(`El rango seleccionado contiene fechas intermedias no disponibles. Selecciona otro periodo libre.`, 'warning');
                return;
              }

              calBookingCheckOut = selectedDate;
              calSelectionStep = 0;
              const dIn = new Date(calBookingCheckIn);
              const dOut = new Date(calBookingCheckOut);
              const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
              showToast(`✅ Estancia seleccionada: ${calBookingCheckIn} al ${calBookingCheckOut} (${nights} noches). ¡Listo para reservar!`, 'success');
            }
          }

          updateCalendarBookingPanel();
          loadAndRenderCalendar(roomId, year, month);
        });
      });

    } catch (err) {
      calDaysGrid.innerHTML = `<div style="grid-column: span 7; color: #f87171; padding: 1.5rem;">Error al consultar calendario: ${err.message}</div>`;
    }
  }

  // Listener para proceder al checkout desde el calendario de la habitación
  btnProceedBookingFromCalendar?.addEventListener('click', async () => {
    if (!calBookingCheckIn || !calBookingCheckOut) {
      showToast('Por favor selecciona las fechas de llegada y salida en el calendario', 'warning');
      return;
    }
    const dIn = new Date(calBookingCheckIn);
    const dOut = new Date(calBookingCheckOut);
    if (dOut <= dIn) {
      showToast('La fecha de salida debe ser posterior a la fecha de llegada', 'warning');
      return;
    }

    const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
    const guestsCount = Number(calClientGuestsSel?.value || 2);
    const totalAmount = nights * calSelectedRoomPrice;

    // Cerrar modal de calendario
    if (roomCalendarModal) roomCalendarModal.style.display = 'none';

    // Iniciar flujo de soft-lock de 10 min en Redis y modal de checkout
    await startCheckoutFlow({
      roomId: calSelectedRoomId,
      roomName: calSelectedRoomName,
      hotelId: calSelectedHotelId,
      hotelName: calSelectedHotelName,
      checkIn: calBookingCheckIn,
      checkOut: calBookingCheckOut,
      nights,
      guestsCount,
      totalAmount,
    });
  });

  calClientGuestsSel?.addEventListener('change', () => {
    updateCalendarBookingPanel();
  });

  // Navegación de mes del calendario
  calPrevMonthBtn?.addEventListener('click', () => {
    calCurrentMonth -= 1;
    if (calCurrentMonth < 1) {
      calCurrentMonth = 12;
      calCurrentYear -= 1;
    }
    if (calSelectedRoomId) loadAndRenderCalendar(calSelectedRoomId, calCurrentYear, calCurrentMonth);
  });

  calNextMonthBtn?.addEventListener('click', () => {
    calCurrentMonth += 1;
    if (calCurrentMonth > 12) {
      calCurrentMonth = 1;
      calCurrentYear += 1;
    }
    if (calSelectedRoomId) loadAndRenderCalendar(calSelectedRoomId, calCurrentYear, calCurrentMonth);
  });

  closeCalModalBtn?.addEventListener('click', () => {
    if (roomCalendarModal) roomCalendarModal.style.display = 'none';
  });

  roomCalendarModal?.addEventListener('click', (e) => {
    if (e.target === roomCalendarModal) roomCalendarModal.style.display = 'none';
  });

  // Admin: Bloquear Fechas (Mantenimiento / Cierre)
  adminBlockForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomId = adminCalRoomId?.value;
    const hotelId = adminCalHotelId?.value;
    const checkIn = adminBlockStart?.value;
    const checkOut = adminBlockEnd?.value;
    const reason = adminBlockReason?.value.trim() || 'Bloqueo administrativo / Mantenimiento';

    if (!roomId || !checkIn || !checkOut) {
      showToast('Por favor completa las fechas de inicio y fin', 'warning');
      return;
    }

    try {
      showToast('Bloqueando fechas seleccionadas...', 'info');
      await api.blockDates({ roomId, hotelId, checkIn, checkOut, reason });
      showToast('¡Fechas bloqueadas exitosamente por administración!', 'success');
      await loadAndRenderCalendar(roomId, calCurrentYear, calCurrentMonth);
      loadRooms();
    } catch (err) {
      showToast(`Error al bloquear fechas: ${err.message}`, 'error');
    }
  });

  // Admin: Habilitar Fechas para Venta
  btnAdminUnblock?.addEventListener('click', async () => {
    const roomId = adminCalRoomId?.value;
    const checkIn = adminBlockStart?.value;
    const checkOut = adminBlockEnd?.value;

    if (!roomId || !checkIn || !checkOut) {
      showToast('Selecciona el rango de fechas a habilitar', 'warning');
      return;
    }

    try {
      showToast('Habilitando fechas para venta al público...', 'info');
      const res = await api.unblockDates({ roomId, checkIn, checkOut });
      showToast(res.message || 'Fechas habilitadas satisfactoriamente', 'success');
      await loadAndRenderCalendar(roomId, calCurrentYear, calCurrentMonth);
      loadRooms();
    } catch (err) {
      showToast(`Error al habilitar fechas: ${err.message}`, 'error');
    }
  });

  // --------------------------------------------------------------------------
  // INICIALIZACIÓN
  // --------------------------------------------------------------------------
  refreshSessionView();
});
