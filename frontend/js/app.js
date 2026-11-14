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
  const payMethodCardBtn = document.getElementById('payMethodCardBtn');
  const payMethodTransferBtn = document.getElementById('payMethodTransferBtn');
  const cardFieldsContainer = document.getElementById('cardFieldsContainer');
  const transferInfoBox = document.getElementById('transferInfoBox');
  const transferRefContainer = document.getElementById('transferRefContainer');
  const transferRefInput = document.getElementById('transferRefInput');
  const filterPaymentsAllBtn = document.getElementById('filterPaymentsAllBtn');
  const filterPaymentsPendingBtn = document.getElementById('filterPaymentsPendingBtn');
  let currentCheckoutMethod = 'CREDIT_CARD';
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

  // Iconos Vectoriales Lineales Minimalistas (Lucide / Phosphor, trazo 1.5px)
  const SVG_ICONS = {
    star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    paw: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"></circle><circle cx="18" cy="8" r="2"></circle><circle cx="20" cy="16" r="2"></circle><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path></svg>',
    noPet: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>',
    compass: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    fileText: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    checkCircle: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    alertCircle: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    infoCircle: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    building: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path></svg>',
    shieldCheck: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
  };

  function renderGoldStars(count = 5) {
    const n = Math.max(1, Math.min(5, Number(count) || 5));
    return Array.from({ length: n }, () => SVG_ICONS.star).join('');
  }

  const TAB_METADATA = {
    hotels: {
      title: 'Nuestras Sedes & Santuarios',
      desc: 'Descubre nuestras exclusivas propiedades en los destinos más emblemáticos de Colombia.',
    },
    availability: {
      title: 'Disponibilidad & Cotización en Tiempo Real',
      desc: 'Consulta tarifas dinámicas, desglose transparente y bloqueo garantizado de habitaciones.',
    },
    rooms: {
      title: 'Nuestras Habitaciones & Suites',
      desc: 'Conoce la arquitectura interior, capacidades, vistas y amenidades de cada categoría.',
    },
    'my-bookings': {
      title: 'Mis Reservas & Vouchers Oficiales',
      desc: 'Gestiona tus estancias, descarga comprobantes oficiales en PDF con código QR y consulta estados.',
    },
    'admin-dashboard': {
      title: 'Panel Ejecutivo & Aprobaciones',
      desc: 'Supervisión de ocupación, ingresos confirmados y validación de reservas pendientes.',
    },
    reception: {
      title: 'Portal de Recepción & Fast Check-In',
      desc: 'Control operativo de llegadas de huéspedes, verificación de reservas y registro de Check-In/Check-Out.',
    },
    usuarios: {
      title: 'Gestión de Cuentas & Personal',
      desc: 'Creación de cuentas de administración, supervisión de accesos y directorio de huéspedes.',
    },
    pagos: {
      title: 'Conciliación de Pagos & Reembolsos',
      desc: 'Visión financiera global de las transacciones y gestión oficial de reembolsos.',
    },
    notifications: {
      title: 'Centro de Notificaciones & Vouchers PDF',
      desc: 'Monitoreo de eventos en RabbitMQ, emisión de comprobantes con código QR y entrega de correos.',
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
  // SISTEMA DE NOTIFICACIONES TOAST EDITORIAL (CREMA / VERDE ESMERALDA)
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', options = {}) {
    if (!toastShelf) return;
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;

    let iconSvg = SVG_ICONS.infoCircle;
    if (type === 'success') iconSvg = SVG_ICONS.checkCircle;
    if (type === 'error' || type === 'warning') iconSvg = SVG_ICONS.alertCircle;

    const cleanMessage = String(message || '').replace(/^[✅🛑⚠️ℹ️🎉📅🔒🔓🗑️⏳💬✨🏨]+\s*/g, '');
    const actionBtnHtml = options.actionUrl
      ? `<a href="${options.actionUrl}" target="_blank" rel="noopener" style="margin-left: auto; background: rgba(255,255,255,0.16); color: inherit; border: 1px solid rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 6px; font-size: 0.74rem; font-weight: 600; text-decoration: none; white-space: nowrap;">${options.actionText || 'Ver Correo'}</a>`
      : '';

    toast.innerHTML = `<span class="toast-icon">${iconSvg}</span><span style="flex:1;">${cleanMessage}</span>${actionBtnHtml}`;
    if (typeof toastShelf.appendChild === 'function') {
      toastShelf.appendChild(toast);
    }

    const duration = options.actionUrl ? 8000 : 4400;
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => {
        if (typeof toast.remove === 'function') toast.remove();
      }, 300);
    }, duration);
  }

  // --------------------------------------------------------------------------
  // DIÁLOGO EDITORIAL PERSONALIZADO (REEMPLAZA CONFIRM & PROMPT DEL NAVEGADOR)
  // --------------------------------------------------------------------------
  const editorialActionModal = document.getElementById('editorialActionModal');
  const editorialActionCloseBtn = document.getElementById('editorialActionCloseBtn');
  const editorialActionIconWrap = document.getElementById('editorialActionIconWrap');
  const editorialActionEyebrow = document.getElementById('editorialActionEyebrow');
  const editorialActionTitle = document.getElementById('editorialActionTitle');
  const editorialActionSubtitle = document.getElementById('editorialActionSubtitle');
  const editorialActionMetaBox = document.getElementById('editorialActionMetaBox');
  const editorialActionInputSection = document.getElementById('editorialActionInputSection');
  const editorialActionInputLabel = document.getElementById('editorialActionInputLabel');
  const editorialQuickReasons = document.getElementById('editorialQuickReasons');
  const editorialActionInput = document.getElementById('editorialActionInput');
  const editorialActionEmailNotice = document.getElementById('editorialActionEmailNotice');
  const editorialActionEmailNoticeText = document.getElementById('editorialActionEmailNoticeText');
  const editorialActionCancelBtn = document.getElementById('editorialActionCancelBtn');
  const editorialActionConfirmBtn = document.getElementById('editorialActionConfirmBtn');
  const editorialActionConfirmText = document.getElementById('editorialActionConfirmText');

  let activeEditorialResolver = null;

  function closeEditorialDialog(result) {
    if (editorialActionModal) editorialActionModal.style.display = 'none';
    if (activeEditorialResolver) {
      const fn = activeEditorialResolver;
      activeEditorialResolver = null;
      fn(result);
    }
  }

  editorialActionCloseBtn?.addEventListener('click', () => closeEditorialDialog(null));
  editorialActionCancelBtn?.addEventListener('click', () => closeEditorialDialog(null));
  editorialActionModal?.addEventListener('click', (e) => {
    if (e.target === editorialActionModal) closeEditorialDialog(null);
  });

  editorialActionConfirmBtn?.addEventListener('click', () => {
    const isInputVisible = editorialActionInputSection && editorialActionInputSection.style.display !== 'none';
    if (isInputVisible) {
      const val = (editorialActionInput?.value || '').trim();
      if (!val) {
        editorialActionInput?.focus();
        showToast('Por favor escribe o selecciona un motivo para continuar.', 'warning');
        return;
      }
      closeEditorialDialog(val);
    } else {
      closeEditorialDialog(true);
    }
  });

  function openEditorialDialog({
    variant = 'emerald', // 'emerald' | 'danger' | 'gold'
    eyebrow = 'CONFIRMACIÓN DE OPERACIÓN',
    title = 'Confirmar Acción',
    subtitle = '¿Deseas continuar con esta operación?',
    metaHtml = '',
    requireInput = false,
    inputLabel = 'Motivo o comentario:',
    inputPlaceholder = 'Escribe el motivo detallado...',
    defaultValue = '',
    quickReasons = [],
    emailNotice = '',
    confirmText = 'Confirmar',
  } = {}) {
    if (!editorialActionModal) {
      return Promise.resolve(requireInput ? (defaultValue || 'Confirmado') : true);
    }

    if (editorialActionEyebrow) editorialActionEyebrow.textContent = eyebrow;
    if (editorialActionTitle) editorialActionTitle.textContent = title;
    if (editorialActionSubtitle) editorialActionSubtitle.textContent = subtitle;

    if (editorialActionIconWrap) {
      if (variant === 'danger') {
        editorialActionIconWrap.style.background = 'rgba(180, 35, 24, 0.08)';
        editorialActionIconWrap.style.color = '#B42318';
        editorialActionIconWrap.style.borderColor = 'rgba(180, 35, 24, 0.25)';
        editorialActionIconWrap.innerHTML = SVG_ICONS.alertCircle;
      } else if (variant === 'gold') {
        editorialActionIconWrap.style.background = 'rgba(166, 138, 86, 0.14)';
        editorialActionIconWrap.style.color = '#8C703E';
        editorialActionIconWrap.style.borderColor = 'rgba(166, 138, 86, 0.35)';
        editorialActionIconWrap.innerHTML = SVG_ICONS.infoCircle;
      } else {
        editorialActionIconWrap.style.background = 'rgba(19, 51, 46, 0.08)';
        editorialActionIconWrap.style.color = '#13332E';
        editorialActionIconWrap.style.borderColor = 'rgba(19, 51, 46, 0.2)';
        editorialActionIconWrap.innerHTML = SVG_ICONS.checkCircle;
      }
    }

    if (editorialActionMetaBox) {
      if (metaHtml) {
        editorialActionMetaBox.innerHTML = metaHtml;
        editorialActionMetaBox.style.display = 'block';
      } else {
        editorialActionMetaBox.style.display = 'none';
      }
    }

    if (editorialActionInputSection) {
      if (requireInput) {
        editorialActionInputSection.style.display = 'flex';
        if (editorialActionInputLabel) editorialActionInputLabel.textContent = inputLabel;
        if (editorialActionInput) {
          editorialActionInput.placeholder = inputPlaceholder;
          editorialActionInput.value = defaultValue || '';
        }
        if (editorialQuickReasons) {
          if (Array.isArray(quickReasons) && quickReasons.length > 0) {
            editorialQuickReasons.style.display = 'flex';
            editorialQuickReasons.innerHTML = quickReasons.map(r => `
              <button type="button" class="editorial-quick-reason-chip"
                style="padding: 4px 10px; font-size: 0.73rem; border-radius: 999px; background: #F2EFE9; border: 1px solid #E5E2DC; color: #2C2A25; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                ${r}
              </button>
            `).join('');
            editorialQuickReasons.querySelectorAll('.editorial-quick-reason-chip').forEach(chip => {
              chip.addEventListener('click', () => {
                if (editorialActionInput) {
                  editorialActionInput.value = chip.textContent.trim();
                  editorialActionInput.focus();
                }
              });
            });
          } else {
            editorialQuickReasons.style.display = 'none';
            editorialQuickReasons.innerHTML = '';
          }
        }
      } else {
        editorialActionInputSection.style.display = 'none';
      }
    }

    if (editorialActionEmailNotice) {
      if (emailNotice) {
        editorialActionEmailNotice.style.display = 'flex';
        if (editorialActionEmailNoticeText) editorialActionEmailNoticeText.textContent = emailNotice;
      } else {
        editorialActionEmailNotice.style.display = 'none';
      }
    }

    if (editorialActionConfirmBtn) {
      if (variant === 'danger') {
        editorialActionConfirmBtn.style.background = '#B42318';
        editorialActionConfirmBtn.style.borderColor = '#B42318';
        editorialActionConfirmBtn.style.color = '#FAF9F6';
      } else {
        editorialActionConfirmBtn.style.background = '#13332E';
        editorialActionConfirmBtn.style.borderColor = '#13332E';
        editorialActionConfirmBtn.style.color = '#FAF9F6';
      }
    }
    if (editorialActionConfirmText) editorialActionConfirmText.textContent = confirmText;

    editorialActionModal.style.display = 'flex';
    if (requireInput && editorialActionInput) {
      setTimeout(() => editorialActionInput.focus(), 60);
    }

    return new Promise((resolve) => {
      activeEditorialResolver = resolve;
    });
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

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Carlos Valderrama';
      if (dashUserName) dashUserName.textContent = fullName;
      if (dashUserEmail) dashUserEmail.textContent = user.email || 'guest@hotel.com';

      const role = user.role || 'GUEST';
      const isAdmin = role === 'HOTEL_ADMIN';

      if (dashRoleBadge) {
        if (isAdmin) {
          dashRoleBadge.textContent = 'Administrador General';
          dashRoleBadge.className = 'dash-badge admin';
          dashRoleBadge.title = 'Rol HOTEL_ADMIN: Gestión operativa, comercial, de tarifas, control de inventario y supervisión general';
        } else {
          dashRoleBadge.textContent = 'Huésped / Viajero';
          dashRoleBadge.className = 'dash-badge guest';
          dashRoleBadge.title = 'Rol GUEST: Búsqueda avanzada, mapas, reservas, cotizaciones y gestión de estancias';
        }
      }

      if (dashAvatar) {
        const initials = fullName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(part => part[0].toUpperCase())
          .join('');
        dashAvatar.textContent = initials || (isAdmin ? 'AD' : 'HV');
      }

      // Ocultar opciones de cliente al Administrador (Admin no realiza reservas)
      document.querySelectorAll('.guest-only').forEach(el => {
        el.style.display = isAdmin ? 'none' : '';
      });

      // Panel exclusivo del Administrador (Panel & Métricas, Check-In/Out, Cuentas, Pagos)
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

      // Registro de Hoteles y Sembrado Demo: Exclusivo de Administradores.
      if (openCreateHotelBtn) {
        openCreateHotelBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      }
      const btnSeedHotels = document.getElementById('btnSeedHotels');
      if (btnSeedHotels) {
        btnSeedHotels.style.display = isAdmin ? 'inline-flex' : 'none';
      }
      // Registro de Habitaciones y Sembrado Demo: Exclusivo de Administradores.
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

    if (tabId === 'reception' && !isStaff) {
      showToast('Acceso restringido: El Portal de Recepción es exclusivo para Administradores', 'warning');
      tabId = 'hotels';
    }

    if ((tabId === 'usuarios' || tabId === 'pagos' || tabId === 'admin-dashboard') && role !== 'HOTEL_ADMIN') {
      showToast('Acceso restringido: esta sección es exclusiva del Administrador General', 'warning');
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
    } else if (tabId === 'admin-dashboard') {
      loadAdminDashboard();
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

  // --------------------------------------------------------------------------
  // INTERACCIONES EDITORIALES DE LOGIN: CARRUSEL KEN BURNS, VISIBILIDAD Y STAGGER
  // --------------------------------------------------------------------------
  function replayStaggerAnimation(container) {
    if (!container) return;
    const items = container.querySelectorAll('.stagger-item');
    items.forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }

  function setupPasswordToggle(btnId, inputId) {
    const toggleBtn = document.getElementById(btnId);
    const inputEl = document.getElementById(inputId);
    if (!toggleBtn || !inputEl) return;

    toggleBtn.addEventListener('click', () => {
      const isPassword = inputEl.type === 'password';
      inputEl.type = isPassword ? 'text' : 'password';
      const eyeOpen = toggleBtn.querySelector('.eye-open');
      const eyeClosed = toggleBtn.querySelector('.eye-closed');
      if (eyeOpen) eyeOpen.style.display = isPassword ? 'none' : 'block';
      if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';
      inputEl.focus();
    });
  }

  setupPasswordToggle('toggleLoginPassword', 'loginPassword');
  setupPasswordToggle('toggleRegPassword', 'regPassword');

  // Carrusel Editorial de Hotelería (Rotación automática cada 6 segundos + Ken Burns)
  const EDITORIAL_SLIDES_DATA = [
    {
      location: 'COLECCIÓN CARIBE & PACÍFICO',
      caption: '“Arquitectura serena donde el diseño orgánico se funde con la calma del océano.”',
    },
    {
      location: 'SANTUARIOS FRENTE AL MAR',
      caption: '“Horizontes infinitos concebidos para la privacidad, el silencio y la contemplación.”',
    },
    {
      location: 'RESIDENCIAS & SUITES DE AUTOR',
      caption: '“Materiales nobles, luz cálida y hospitalidad a medida en cada rincón de su estancia.”',
    },
  ];

  const editorialSlides = document.querySelectorAll('.editorial-slide');
  const editorialProgressTracks = document.querySelectorAll('.editorial-progress-track');
  const editorialSlideLocation = document.getElementById('editorialSlideLocation');
  const editorialSlideCaption = document.getElementById('editorialSlideCaption');
  let currentEditorialSlide = 0;
  let editorialCarouselTimer = null;

  function setEditorialSlide(index) {
    if (!editorialSlides.length) return;
    currentEditorialSlide = (index + editorialSlides.length) % editorialSlides.length;

    editorialSlides.forEach((slide, idx) => {
      if (idx === currentEditorialSlide) {
        slide.classList.remove('active');
        void slide.offsetWidth;
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    editorialProgressTracks.forEach((track, idx) => {
      track.classList.remove('active', 'completed');
      const fill = track.querySelector('.editorial-progress-fill');
      if (fill) {
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
      }
      if (idx < currentEditorialSlide) {
        track.classList.add('completed');
      } else if (idx === currentEditorialSlide) {
        track.classList.add('active');
      }
    });

    const meta = EDITORIAL_SLIDES_DATA[currentEditorialSlide];
    if (meta && editorialSlideCaption && editorialSlideLocation) {
      editorialSlideCaption.style.opacity = '0';
      editorialSlideCaption.style.transform = 'translateY(6px)';
      setTimeout(() => {
        editorialSlideLocation.textContent = meta.location;
        editorialSlideCaption.textContent = meta.caption;
        editorialSlideCaption.style.opacity = '1';
        editorialSlideCaption.style.transform = 'translateY(0)';
      }, 220);
    }
  }

  function startEditorialCarousel() {
    if (!editorialSlides.length) return;
    if (editorialCarouselTimer) clearInterval(editorialCarouselTimer);
    editorialCarouselTimer = setInterval(() => {
      setEditorialSlide(currentEditorialSlide + 1);
    }, 6000);
  }

  editorialProgressTracks.forEach((track) => {
    track.addEventListener('click', () => {
      const targetIdx = Number(track.getAttribute('data-slide-target') || 0);
      setEditorialSlide(targetIdx);
      startEditorialCarousel();
    });
  });

  startEditorialCarousel();

  // Alternar Login y Registro con entrada escalonada
  goToRegisterLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormView.style.display = 'none';
    registerFormView.style.display = 'block';
    replayStaggerAnimation(registerFormView);
  });

  goToLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    registerFormView.style.display = 'none';
    loginFormView.style.display = 'block';
    replayStaggerAnimation(loginFormView);
  });

  forgotPassLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Para restablecer tu contraseña, contacta a concierge@travelresorts.com', 'info');
  });

  // Explorar como huésped rápido
  exploreAsGuestBtn?.addEventListener('click', async () => {
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
      await api.login(email, password);
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

  // Envío de Login con estado de carga y spinner minimalista
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    submitLoginBtn.disabled = true;
    submitLoginBtn.innerHTML = '<span class="editorial-spinner" aria-hidden="true"></span><span class="btn-label-text">Verificando credenciales...</span>';

    try {
      const res = await api.login(email, password);
      showToast(`¡Bienvenido de nuevo, ${res.user.firstName}!`, 'success');
      refreshSessionView();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitLoginBtn.disabled = false;
      submitLoginBtn.innerHTML = '<span class="btn-label-text">Iniciar sesión</span>';
    }
  });

  // Envío de Registro con estado de carga y spinner minimalista
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    submitRegBtn.disabled = true;
    submitRegBtn.innerHTML = '<span class="editorial-spinner" aria-hidden="true"></span><span class="btn-label-text">Creando cuenta...</span>';

    try {
      await api.register({ firstName, lastName, email, phone, password }, false);
      showToast(`¡Cuenta creada con éxito! Hemos enviado una confirmación a ${email}. Inicia sesión ahora.`, 'success');

      registerForm.reset();
      registerFormView.style.display = 'none';
      loginFormView.style.display = 'block';
      replayStaggerAnimation(loginFormView);

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
      submitRegBtn.innerHTML = '<span class="btn-label-text">Crear cuenta de huésped</span>';
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
            <span style="color: #B42318;">Error al consultar catálogo: ${err.message}</span>
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
          <span>No se encontraron propiedades con los criterios seleccionados.</span>
          <span style="font-size: 0.78rem; color: var(--editorial-text-subtle);">Intenta limpiar o ajustar los filtros de búsqueda.</span>
        </div>
      `;
      return;
    }

    const currentUser = api.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'HOTEL_ADMIN';

    hotelsGrid.innerHTML = hotels.map((h, idx) => {
      const starsHtml = renderGoldStars(h.stars || 5);
      const isPet = h.petFriendly ?? h.isPetFriendly;
      const petHtml = isPet
        ? `<div class="hotel-policy-pill pet-yes">${SVG_ICONS.paw}<span>Pet-friendly</span></div>`
        : `<div class="hotel-policy-pill">${SVG_ICONS.noPet}<span>Sin mascotas</span></div>`;

      const amenitiesStr = Array.isArray(h.amenities)
        ? h.amenities.slice(0, 4).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('')
        : '';
      const hotelImg = extractHotelImg(h);

      const adminButtons = isAdmin ? `
        <div class="hotel-admin-actions">
          <button class="btn-card-edit" data-id="${h.id}" title="Editar Sede">${SVG_ICONS.edit}</button>
          <button class="btn-card-delete" data-id="${h.id}" data-name="${h.name}" title="Desactivar Sede">${SVG_ICONS.trash}</button>
        </div>
      ` : '';

      return `
        <article class="hotel-card" data-id="${h.id}" style="--card-idx: ${idx};">
          <div class="hotel-card-media">
            <img src="${hotelImg}" alt="${h.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-city">${h.city || 'Colombia'}</div>
            <div class="badge-stars" aria-label="${h.stars || 5} estrellas">${starsHtml}</div>
            ${adminButtons}
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${h.name}</h3>
            <div class="hotel-card-location">${SVG_ICONS.mapPin}<span>${h.address}, ${h.city}</span></div>
            <p class="hotel-card-desc">${h.description || ''}</p>
            <div class="hotel-amenities-tags">${amenitiesStr}</div>
          </div>
          <div class="hotel-card-footer">
            ${petHtml}
            <div class="hotel-card-actions">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${h.latitude || 10.4042},${h.longitude || -75.5562}" target="_blank" rel="noopener" class="btn-hotel-secondary" style="height: 38px; padding: 0 0.7rem;" title="Calcular ruta en Google Maps">
                ${SVG_ICONS.compass}
              </a>
              <button type="button" class="btn-hotel-detail" data-id="${h.id}">Ver Ficha</button>
              <button type="button" class="btn-blue btn-quick-book" data-id="${h.id}" data-name="${h.name}">Reservar</button>
            </div>
          </div>
        </article>
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
        const ok = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'GESTIÓN DE CATÁLOGO HOTELERO',
          title: 'Desactivar Sede Hotelera',
          subtitle: `¿Confirmas que deseas desactivar la propiedad "${name}" del catálogo público?`,
          confirmText: 'Desactivar Propiedad',
        });
        if (ok) {
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
      document.getElementById('detailAddress').innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.35rem;">${SVG_ICONS.mapPin}<span>${hotel.address}, ${hotel.city}</span></span>`;
      document.getElementById('detailDescription').textContent = hotel.description;
      document.getElementById('detailStars').innerHTML = renderGoldStars(hotel.stars || 5);
      document.getElementById('detailCity').textContent = hotel.city;
      document.getElementById('detailImg').src = hotelImg;
      document.getElementById('detailCheckIn').textContent = hotel.checkInTime || '15:00';
      document.getElementById('detailCheckOut').textContent = hotel.checkOutTime || '11:00';
      document.getElementById('detailPetFriendly').textContent = isPet ? 'Sí, propiedad pet-friendly' : 'No se admiten mascotas';
      document.getElementById('detailPetFriendly').style.color = isPet ? 'var(--editorial-emerald)' : 'var(--editorial-danger)';
      document.getElementById('detailContact').textContent = `${hotel.phone || hotel.contactPhone || 'N/A'} · ${hotel.email || hotel.contactEmail || 'N/A'}`;
      document.getElementById('detailCancellation').textContent = hotel.cancellationPolicy || 'Cancelación gratuita hasta 48 horas antes de la llegada.';

      const amenitiesBox = document.getElementById('detailAmenities');
      amenitiesBox.innerHTML = Array.isArray(hotel.amenities)
        ? hotel.amenities.map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('')
        : '<span style="color: var(--editorial-text-subtle);">Sin amenidades registradas</span>';

      // Coordenadas y Mapa Interactivo de Google Maps
      const lat = hotel.latitude || 10.4042;
      const lng = hotel.longitude || -75.5562;
      const mapIframe = document.getElementById('detailMapIframe');
      if (mapIframe) {
        mapIframe.src = `https://www.google.com/maps?q=${lat},${lng}&hl=es&z=15&output=embed`;
      }
      const dirLink = document.getElementById('btnDetailDirections');
      if (dirLink) {
        dirLink.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }

      // Generar Puntos de Interés Cercanos (POIs) según ciudad
      const poisBox = document.getElementById('detailNearbyPois');
      if (poisBox) {
        const city = (hotel.city || '').toLowerCase();
        let pois = [];
        if (city.includes('cartagena')) {
          pois = [
            'Aeropuerto Int. Rafael Núñez (15 min)',
            'Ciudad Amurallada & Torre del Reloj (10 min)',
            'Playa Bocagrande (Acceso directo)',
            'Restaurantes de Autor Carmen & Candé (12 min)'
          ];
        } else if (city.includes('medell')) {
          pois = [
            'Aeropuerto Olaya Herrera (12 min)',
            'Parque Lleras & Provenza (5 min a pie)',
            'Plaza Botero & Museo de Antioquia (20 min)',
            'Rooftop Bar Panorámico (En la propiedad)'
          ];
        } else if (city.includes('santa marta')) {
          pois = [
            'Parque Nacional Tayrona (40 min)',
            'Marina Internacional de Santa Marta (10 min)',
            'Playa El Rodadero (15 min)',
            'Aeropuerto Simón Bolívar (25 min)'
          ];
        } else if (city.includes('san andr')) {
          pois = [
            'Cayo Johnny Cay & Acuario (15 min en lancha)',
            'Playa Spratt Bight (5 min)',
            'El Hoyo Soplador (20 min)',
            'Aeropuerto Gustavo Rojas Pinilla (8 min)'
          ];
        } else {
          pois = [
            'Aeropuerto Internacional (20 min)',
            'Centro Histórico & Financiero (10 min)',
            'Distrito Gastronómico de Autor (5 min)'
          ];
        }

        poisBox.innerHTML = pois.map(p => `
          <span class="hotel-amenity-tag">${p}</span>
        `).join('');
      }

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
    const chkActive = document.getElementById('formHotelIsActive'); if (chkActive) chkActive.checked = true;
    hotelFormTitle.textContent = 'Registrar Nueva Sede Hotelera';
    hotelFormModal.style.display = 'flex';
  });

  const btnSeedHotels = document.getElementById('btnSeedHotels');
  btnSeedHotels?.addEventListener('click', async () => {
    const ok = await openEditorialDialog({
      variant: 'emerald',
      eyebrow: 'CATÁLOGO DEMOSTRATIVO',
      title: 'Restaurar Sedes Oficiales',
      subtitle: 'Se poblará el catálogo hotelero con las propiedades insignia de Bogotá, Cartagena, Medellín, Santa Marta y San Andrés.',
      confirmText: 'Poblar Catálogo',
    });
    if (!ok) return;
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
      const chkActive = document.getElementById('formHotelIsActive'); if (chkActive) chkActive.checked = hotel.isActive !== false;

      hotelFormTitle.textContent = `Editar Sede: ${hotel.name}`;
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
      isActive: document.getElementById('formHotelIsActive') ? document.getElementById('formHotelIsActive').checked : true,
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
            <span style="color: #B42318;">Error al consultar disponibilidad: ${err.message}</span>
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
          <span style="font-size: 0.78rem; margin-top: 0.3rem; color: var(--editorial-text-subtle);">Prueba con otras fechas o reduce el número de personas.</span>
        </div>
      `;
      return;
    }

    availRoomsGrid.innerHTML = rooms.map((r, idx) => {
      const img = (Array.isArray(r.images) && r.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';
      const typeLabel = ROOM_TYPE_NAMES[r.roomType] || r.roomType;
      const quote = r.quote || {};
      const nights = quote.nights || 1;
      const baseRate = getCOPPrice(quote.basePricePerNight || 350000);
      const surcharges = getCOPPrice(quote.surcharges || 0);
      const totalAmount = getCOPPrice(quote.totalAmount || (baseRate * nights));

      const weekendNotice = surcharges > 0
        ? `<div style="font-size: 0.74rem; color: var(--editorial-gold); margin-top: 3px;">Incluye +${formatCOP(surcharges)} (Tarifa fin de semana)</div>`
        : '';

      const amenitiesHtml = (r.amenities || []).slice(0, 4).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('');

      return `
        <article class="hotel-card" data-room-id="${r.id}" style="--card-idx: ${idx};">
          <div class="hotel-card-media">
            <img src="${img}" alt="${r.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-city">#${r.roomNumber} · Vista ${r.viewType || 'Panorámica'}</div>
            <div class="badge-stars">${typeLabel}</div>
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${r.name}</h3>
            <div class="hotel-card-location">${SVG_ICONS.building}<span>${r.hotelName || 'Sede Principal'}</span></div>
            <div style="font-size: 0.8rem; color: var(--editorial-text-muted); margin: 0.25rem 0;">
              Hasta ${r.maxAdults} adultos · ${r.bedType || 'Cama King'} · ${r.sizeSqm || 35} m²
            </div>
            <div class="hotel-amenities-tags">${amenitiesHtml}</div>

            <!-- Desglose de Cotización Transparente -->
            <div style="margin-top: 0.75rem; padding: 0.85rem; background: var(--editorial-bg); border: 1px solid var(--editorial-border); border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--editorial-text-muted);">
                <span>Tarifa base (${nights} ${nights === 1 ? 'noche' : 'noches'}):</span>
                <span>${formatCOP(baseRate * nights)}</span>
              </div>
              ${weekendNotice}
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.45rem; padding-top: 0.45rem; border-top: 1px dashed var(--editorial-border-hover);">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--editorial-text-main);">Total Estancia:</span>
                <span style="font-family: var(--editorial-font-serif); font-size: 1.2rem; font-weight: 600; color: var(--editorial-emerald);">${formatCOP(totalAmount)}</span>
              </div>
            </div>
          </div>
          <div class="hotel-card-footer">
            <div class="hotel-policy-pill pet-yes">${SVG_ICONS.shieldCheck}<span>Bloqueo garantizado 15 min</span></div>
            <button type="button" class="btn-blue btn-start-booking"
              data-room-id="${r.id}"
              data-room-name="${r.name}"
              data-hotel-id="${r.hotelId || searchParams.hotelId}"
              data-hotel-name="${r.hotelName || 'Hotel de Lujo'}"
              data-total="${totalAmount}"
              data-nights="${nights}"
              data-checkin="${searchParams.checkIn}"
              data-checkout="${searchParams.checkOut}"
              data-guests="${searchParams.guests}">
              <span>Reservar</span>
            </button>
          </div>
        </article>
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
    showToast('Bloqueando habitación temporalmente por 15 minutos...', 'info');

    try {
      // 1. Crear el hold atómico en availability-service (Redis Lua) con TTL de 15 minutos (900 seg)
      const holdRes = await api.holdRoom({
        roomId: item.roomId,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        guestsCount: item.guestsCount,
        ttlSeconds: 900, // 15 minutos
      });

      const holdId = holdRes.holdId;
      const fullTotal = item.totalAmount;
      const halfTotal = Math.round(fullTotal * 0.5 * 100) / 100;

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
        totalAmount: fullTotal,
        amountToPay: fullTotal,
        depositPercentage: 100,
        remainingBalance: 0,
        currency: 'USD',
        remainingSeconds: 900,
      };

      // 2. Poblar Modal de Checkout
      if (checkoutRoomName) checkoutRoomName.textContent = item.roomName;
      if (checkoutHotelName) checkoutHotelName.textContent = item.hotelName;
      if (checkoutCheckIn) checkoutCheckIn.textContent = item.checkIn;
      if (checkoutCheckOut) checkoutCheckOut.textContent = item.checkOut;
      if (checkoutNights) checkoutNights.textContent = `${item.nights} noche(s)`;
      if (checkoutGuests) checkoutGuests.textContent = `${item.guestsCount} persona(s)`;
      if (checkoutTotalAmount) checkoutTotalAmount.textContent = formatCOP(fullTotal);

      const elAmountToPay = document.getElementById('checkoutAmountToPay');
      const elRemainingBal = document.getElementById('checkoutRemainingBalance');
      const elBalRow = document.getElementById('checkoutBalanceRow');
      if (elAmountToPay) elAmountToPay.textContent = formatCOP(fullTotal);
      if (elRemainingBal) elRemainingBal.textContent = formatCOP(0);
      if (elBalRow) elBalRow.style.display = 'none';

      // Configurar contacto y WhatsApp del dueño del hotel
      setupOwnerWhatsAppInfo(item);

      // Autocompletar datos de usuario
      const currentUser = api.getCurrentUser();
      if (cardHolder && currentUser) {
        cardHolder.value = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Huésped';
      }
      if (cardNumber) cardNumber.value = '4242 4242 4242 4242';
      if (cardExp) cardExp.value = '12/28';
      if (cardCvc) cardCvc.value = '888';

      // 3. Iniciar temporizador de 15 minutos (900 segundos)
      startHoldCountdown(900);

      // Activar por defecto el método directo / transferencia
      setupDefaultDirectPayment();

      // 4. Mostrar Modal
      checkoutModal.style.display = 'flex';
      showToast('¡Habitación reservada exclusivamente para ti durante 15 minutos!', 'success');
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

  closeCheckoutModalBtn?.addEventListener('click', async () => {
    const ok = await openEditorialDialog({
      variant: 'gold',
      eyebrow: 'LIBERACIÓN DE BLOQUEO TEMPORAL',
      title: '¿Salir del Proceso de Reserva?',
      subtitle: 'Si cierras esta ventana, se liberará el bloqueo temporal de 15 minutos sobre la suite seleccionada.',
      confirmText: 'Liberar y Salir',
    });
    if (ok) {
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


  
  // Selector de 50% vs 100% en Checkout (Booking Style)
  const payPercent100Btn = document.getElementById('payPercent100Btn');
  const payPercent50Btn = document.getElementById('payPercent50Btn');
  const paymentSplitNotice = document.getElementById('paymentSplitNotice');
  const checkoutAmountToPay = document.getElementById('checkoutAmountToPay');
  const checkoutRemainingBalance = document.getElementById('checkoutRemainingBalance');
  const checkoutBalanceRow = document.getElementById('checkoutBalanceRow');

  payPercent100Btn?.addEventListener('click', () => {
    if (!activeHold) return;
    activeHold.depositPercentage = 100;
    activeHold.amountToPay = activeHold.totalAmount;
    activeHold.remainingBalance = 0;

    payPercent100Btn.style.borderColor = '#34d399';
    payPercent100Btn.style.background = 'rgba(52, 211, 153, 0.18)';
    payPercent100Btn.style.color = '#34d399';
    if (payPercent50Btn) {
      payPercent50Btn.style.borderColor = 'rgba(255,255,255,0.15)';
      payPercent50Btn.style.background = 'transparent';
      payPercent50Btn.style.color = 'var(--text-dim)';
    }

    if (checkoutAmountToPay) checkoutAmountToPay.textContent = formatCOP(activeHold.amountToPay);
    if (checkoutBalanceRow) checkoutBalanceRow.style.display = 'none';
    if (paymentSplitNotice) paymentSplitNotice.textContent = 'Pagas el 100% de la estancia en este momento.';

    updateWhatsAppMessage(activeHold);
  });

  payPercent50Btn?.addEventListener('click', () => {
    if (!activeHold) return;
    const half = Math.round(activeHold.totalAmount * 0.5 * 100) / 100;
    activeHold.depositPercentage = 50;
    activeHold.amountToPay = half;
    activeHold.remainingBalance = activeHold.totalAmount - half;

    payPercent50Btn.style.borderColor = '#fbbf24';
    payPercent50Btn.style.background = 'rgba(251, 191, 36, 0.18)';
    payPercent50Btn.style.color = '#fbbf24';
    if (payPercent100Btn) {
      payPercent100Btn.style.borderColor = 'rgba(255,255,255,0.15)';
      payPercent100Btn.style.background = 'transparent';
      payPercent100Btn.style.color = 'var(--text-dim)';
    }

    if (checkoutAmountToPay) checkoutAmountToPay.textContent = formatCOP(activeHold.amountToPay);
    if (checkoutRemainingBalance) checkoutRemainingBalance.textContent = formatCOP(activeHold.remainingBalance);
    if (checkoutBalanceRow) checkoutBalanceRow.style.display = 'flex';
    if (paymentSplitNotice) paymentSplitNotice.textContent = `Abonas el 50% (${formatCOP(half)}) para asegurar tu reserva. El saldo restante de ${formatCOP(activeHold.remainingBalance)} se paga directamente en el hotel al realizar el Check-In.`;

    updateWhatsAppMessage(activeHold);
  });

  // ==========================================================================
  // GESTIÓN DE PAGO DIRECTO EN CHAT CON EL ENCARGADO / DUEÑO (MODELO BOOKING)
  // ==========================================================================
  const btnConfirmAndChatWhatsApp = document.getElementById('btnConfirmAndChatWhatsApp');
  const btnChatText = document.getElementById('btnChatText');
  const bookingPendingWaModal = document.getElementById('bookingPendingWaModal');
  const pendingWaBookingCode = document.getElementById('pendingWaBookingCode');
  const pendingWaAmountText = document.getElementById('pendingWaAmountText');
  const pendingWaPercentText = document.getElementById('pendingWaPercentText');
  const btnReopenWhatsAppChat = document.getElementById('btnReopenWhatsAppChat');
  const btnClosePendingWaModal = document.getElementById('btnClosePendingWaModal');

  let currentPendingWaUrl = '#';

  const OFFICIAL_WHATSAPP_NUMBER = '573046598870';
  const OFFICIAL_WHATSAPP_DISPLAY = '+57 304 659 8870';

  function setupOwnerWhatsAppInfo(payload) {
    const ownerHotelName = document.getElementById('ownerHotelName');
    const ownerPhoneText = document.getElementById('ownerPhoneText');

    const hotel = selectedHotelForBooking || {};
    const hotelName = payload.hotelName || hotel.name || 'Sede Hotelera';

    if (ownerHotelName) ownerHotelName.textContent = hotelName;
    if (ownerPhoneText) ownerPhoneText.textContent = OFFICIAL_WHATSAPP_DISPLAY;
  }

  function updateWhatsAppMessage(payload) {
    // No-op ya que el mensaje final se genera dinámicamente con el bookingCode oficial
  }

  function setupDefaultDirectPayment() {
    // Modo directo por chat activado por defecto
  }

  // Acción Principal: Confirmar Pre-Reserva y Abrir Chat de WhatsApp con el Encargado (3046598870)
  btnConfirmAndChatWhatsApp?.addEventListener('click', async () => {
    if (!activeHold) {
      showToast('No hay una habitación activa en bloqueo temporal', 'error');
      return;
    }

    btnConfirmAndChatWhatsApp.disabled = true;
    if (btnChatText) btnChatText.textContent = 'ASEGURANDO HABITACIÓN...';

    try {
      showToast('Asegurando habitación por 15 minutos en el sistema...', 'info');

      const depositPct = activeHold.depositPercentage || 100;
      const amountToPay = activeHold.amountToPay || activeHold.totalAmount;
      const notes = `Pre-reserva Modelo Booking: Pago directo gestionado por chat WhatsApp (${OFFICIAL_WHATSAPP_DISPLAY}) (${depositPct}% = ${formatCOP(amountToPay)})`;

      // 1. Crear Reserva en booking-service con el holdId adquirido
      const bookingPayload = {
        roomId: activeHold.roomId,
        hotelId: activeHold.hotelId,
        checkIn: activeHold.checkIn,
        checkOut: activeHold.checkOut,
        guestsCount: activeHold.guestsCount,
        holdId: activeHold.holdId,
        specialRequests: notes,
      };

      const bookingRes = await api.createBooking(bookingPayload);
      const booking = bookingRes.booking || bookingRes;

      // 2. Registrar el intento de pago directo en payment-service (en estado PENDING para revisión del Admin)
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const txRef = `WA-CHAT-${booking.bookingCode || Date.now().toString().slice(-6)}`;
      const bookingBaseAmount = Number(booking.totalAmount) || Number(activeHold.totalAmount) || 0;
      const paymentAmountToSend = depositPct === 50
        ? Math.round(bookingBaseAmount * 0.5 * 100) / 100
        : bookingBaseAmount;

      try {
        await api.processPayment({
          bookingId: booking.id,
          idempotencyKey,
          amount: Number(paymentAmountToSend),
          currency: booking.currency || 'USD',
          paymentMethod: 'TRANSFER',
          transferReference: txRef,
        });
      } catch (payErr) {
        console.warn('Nota: Pago directo registrado para verificación posterior:', payErr.message);
      }

      // 3. Línea oficial de WhatsApp para gestión de reservas: 3046598870
      const hotel = selectedHotelForBooking || {};
      const cleanPhone = OFFICIAL_WHATSAPP_NUMBER;

      // 4. Armar el mensaje prellenado para WhatsApp con el código oficial de reserva
      const percentLabel = (depositPct === 50) ? '50% (Anticipo de Garantía)' : '100% (Pago Total de la Estancia)';
      const waMessage = `¡Hola! Acabo de realizar la pre-reserva de la habitación *${activeHold.roomName || 'Habitación'}* en *${activeHold.hotelName || hotel.name || 'Travel & Resorts'}*.

• *Código de Reserva:* ${booking.bookingCode}
• *Estancia:* ${activeHold.checkIn} al ${activeHold.checkOut} (${activeHold.nights} noches)
• *Huéspedes:* ${activeHold.guestsCount} persona(s)
• *Modalidad elegida:* ${percentLabel}
• *Monto a Pagar:* ${formatCOP(amountToPay)}
• *Estado en Plataforma:* Habitación bloqueada temporalmente por 15 minutos en espera de validación de pago.

¿Me confirma por favor los datos de la cuenta (Nequi / Bancolombia / Daviplata) para enviarle el comprobante y autorizar mi reserva? ¡Muchas gracias!`;

      currentPendingWaUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMessage)}`;

      // 5. Abrir WhatsApp en pestaña nueva
      window.open(currentPendingWaUrl, '_blank');

      // 6. Cerrar modal de checkout y limpiar timer
      if (activeHold.timerId) clearInterval(activeHold.timerId);
      activeHold = null;
      checkoutModal.style.display = 'none';

      // 7. Mostrar modal de confirmación de pre-reserva y chat
      if (pendingWaBookingCode) pendingWaBookingCode.textContent = booking.bookingCode;
      if (pendingWaAmountText) pendingWaAmountText.textContent = formatCOP(amountToPay);
      if (pendingWaPercentText) pendingWaPercentText.textContent = percentLabel;
      if (btnReopenWhatsAppChat) btnReopenWhatsAppChat.href = currentPendingWaUrl;

      if (bookingPendingWaModal) bookingPendingWaModal.style.display = 'flex';
      showToast('¡Pre-reserva creada! Chat de WhatsApp (304 659 8870) abierto.', 'success');

      // Refrescar vistas en segundo plano
      if (typeof loadMyBookings === 'function') loadMyBookings();
      if (typeof loadAdminDashboard === 'function') loadAdminDashboard();
      if (typeof loadReceptionBookings === 'function') loadReceptionBookings();
    } catch (err) {
      showToast(`Error al procesar la pre-reserva: ${err.message}`, 'error');
    } finally {
      btnConfirmAndChatWhatsApp.disabled = false;
      if (btnChatText) btnChatText.textContent = 'Reservar y Gestionar Pago por WhatsApp';
    }
  });

  // Modal 2.5: Botones de interacción
  btnClosePendingWaModal?.addEventListener('click', () => {
    if (bookingPendingWaModal) bookingPendingWaModal.style.display = 'none';
    switchDashboardTab('my-bookings');
  });

  bookingPendingWaModal?.addEventListener('click', (e) => {
    if (e.target === bookingPendingWaModal) {
      bookingPendingWaModal.style.display = 'none';
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
          <span style="color: #B42318;">Error al consultar reservas: ${err.message}</span>
        </div>
      `;
    }
  }

  const BOOKING_STATUS_MAP = {
    CONFIRMED: { label: 'Confirmada', color: '#13332E', bg: 'rgba(19, 51, 46, 0.09)' },
    CHECKED_IN: { label: 'En Estancia (Check-In)', color: '#1F6E58', bg: 'rgba(31, 110, 88, 0.12)' },
    COMPLETED: { label: 'Finalizada (Check-Out)', color: '#66635B', bg: '#F2EFE9' },
    CANCELLED: { label: 'Cancelada', color: '#9E3B33', bg: 'rgba(158, 59, 51, 0.1)' },
    PENDING_PAYMENT: { label: 'Pendiente de Aprobación', color: '#8C6D32', bg: 'rgba(166, 138, 86, 0.16)' },
  };

  function renderMyBookings(bookings = []) {
    if (!myBookingsList) return;

    if (bookings.length === 0) {
      myBookingsList.innerHTML = `
        <div class="empty-hotels-box">
          <span>Aún no tienes estancias reservadas.</span>
          <span style="font-size: 0.8rem; margin-top: 0.35rem; color: var(--editorial-text-subtle);">
            Utiliza la sección "Buscar Disponibilidad" para elegir tu próximo destino.
          </span>
        </div>
      `;
      return;
    }

    myBookingsList.innerHTML = bookings.map(b => {
      const st = BOOKING_STATUS_MAP[b.status] || { label: b.status, color: '#1C1B18', bg: '#F2EFE9' };
      const canCancel = b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT';

      return `
        <div class="booking-card" data-booking-id="${b.id}">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--editorial-border); padding-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-family: var(--editorial-font-serif); font-size: 1.2rem; font-weight: 600; color: var(--editorial-emerald); letter-spacing: 0.04em;">
                ${b.bookingCode}
              </span>
              <span style="font-size: 0.73rem; padding: 3px 11px; border-radius: 999px; background: ${st.bg}; color: ${st.color}; font-weight: 600; border: 1px solid ${st.color}33;">
                ${st.label}
              </span>
            </div>
            <div style="font-size: 0.82rem; color: var(--editorial-text-subtle);">
              Reservado el: <span style="color: var(--editorial-text-main); font-weight: 500;">${new Date(b.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.85rem;">
            <div>
              <div class="editorial-eyebrow-label" style="font-size: 0.68rem;">PROPIEDAD &amp; SUITE</div>
              <div style="font-family: var(--editorial-font-serif); font-weight: 600; font-size: 1.02rem; color: var(--editorial-text-main); margin-top: 3px;">${b.hotelName}</div>
              <div style="color: var(--editorial-gold); font-size: 0.82rem; font-weight: 500;">${b.roomName}</div>
            </div>

            <div>
              <div class="editorial-eyebrow-label" style="font-size: 0.68rem;">FECHAS DE ESTANCIA</div>
              <div style="color: var(--editorial-text-main); margin-top: 3px; display: inline-flex; align-items: center; gap: 0.35rem;">
                ${SVG_ICONS.calendar}
                <span><strong>${b.checkIn}</strong> al <strong>${b.checkOut}</strong></span>
              </div>
              <div style="color: var(--editorial-text-muted); font-size: 0.78rem; margin-top: 2px;">${b.nights} noche(s) · ${b.guestsCount} huésped(es)</div>
            </div>

            <div>
              <div class="editorial-eyebrow-label" style="font-size: 0.68rem;">VALOR ESTANCIA</div>
              <div style="font-family: var(--editorial-font-serif); font-size: 1.2rem; font-weight: 600; color: var(--editorial-emerald); margin-top: 3px;">
                ${formatCOP(b.totalAmount)}
              </div>
            </div>
          </div>

          ${b.status === 'PENDING_PAYMENT' ? `
            <div style="background: var(--editorial-pill-sand); border: 1px solid rgba(166, 138, 86, 0.4); border-radius: 8px; padding: 0.7rem 0.95rem; font-size: 0.8rem; color: var(--editorial-text-main); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <strong>En Revisión Administrativa:</strong> Tu pago directo o transferencia está siendo verificado por el Administrador (${OFFICIAL_WHATSAPP_DISPLAY}). Tus fechas se encuentran protegidas en el inventario.
              </div>
              <a href="https://api.whatsapp.com/send?phone=${OFFICIAL_WHATSAPP_NUMBER}&text=${encodeURIComponent('Hola, envío comprobante de pago para autorizar mi reserva ' + b.bookingCode + ' en ' + b.hotelName + ' (' + b.checkIn + ' al ' + b.checkOut + ').')}"
                target="_blank" rel="noopener" class="btn-hotel-primary" style="text-decoration: none; font-size: 0.76rem; padding: 0.45rem 0.85rem;">
                <span>Contactar WhatsApp (304 659 8870)</span>
              </a>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; gap: 0.65rem; border-top: 1px solid var(--editorial-border); padding-top: 0.85rem; flex-wrap: wrap;">
            <button type="button" class="btn-hotel-secondary btn-download-voucher"
              data-code="${b.bookingCode}"
              data-hotel="${b.hotelName}"
              data-room="${b.roomName}"
              data-checkin="${b.checkIn}"
              data-checkout="${b.checkOut}"
              data-nights="${b.nights}"
              data-guests="${b.guestsCount}"
              data-total="${getCOPPrice(b.totalAmount)}"
              data-currency="${b.currency || 'COP'}">
              ${SVG_ICONS.fileText}
              <span>Descargar Voucher PDF (QR)</span>
            </button>

            ${canCancel ? `
              <button type="button" class="btn-hotel-secondary danger btn-cancel-booking" data-id="${b.id}" data-code="${b.bookingCode}">
                <span>Cancelar Reserva</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Eventos de botones
    document.querySelectorAll('.btn-open-modify-booking').forEach(btn => {
      btn.addEventListener('click', () => {
        openModifyBookingModal({
          bookingCode: btn.getAttribute('data-code'),
          userName: btn.getAttribute('data-name'),
          guestsCount: btn.getAttribute('data-guests'),
          specialRequests: btn.getAttribute('data-requests'),
        });
      });
    });

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
          paymentMethod: 'Reserva Verificada Travel & Resorts',
        };
        showToast('Generando voucher oficial en PDF con QR...', 'info');
        api.downloadVoucherPdf(voucherData);
      });
    });

    document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const code = btn.getAttribute('data-code');
        const ok = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'CANCELACIÓN DE ESTANCIA',
          title: `Cancelar Reserva ${code}`,
          subtitle: '¿Confirmas que deseas cancelar esta reserva? Las fechas serán liberadas inmediatamente en el inventario del hotel.',
          emailNotice: 'Recibirás el comprobante de cancelación en tu correo electrónico registrado.',
          confirmText: 'Confirmar Cancelación',
        });
        if (!ok) return;

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
          <td colspan="7" style="text-align: center; color: #B42318; padding: 2rem;">
            Error cargando información de recepción: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  // Función auxiliar unificada para aprobar cualquier reserva y notificar por correo al huésped
  async function approveReservationUnified(codeOrId, bookingIdFallback) {
    let res = null;
    try {
      res = await api.approvePayment(codeOrId);
    } catch (firstErr) {
      const target = bookingIdFallback || codeOrId;
      res = await api.request(`/api/bookings/${target}/confirm-payment`, {
        method: 'PATCH',
        body: JSON.stringify({
          bookingId: target,
          bookingCode: codeOrId,
          transactionReference: `WA-APPROVED-${codeOrId}`,
        }),
      });
    }
    if (typeof loadNotificationHistory === 'function') loadNotificationHistory();
    return res;
  }

  // Función auxiliar unificada para rechazar cualquier reserva, liberar fechas y notificar por correo al huésped
  async function rejectReservationUnified(codeOrId, reason, bookingIdFallback) {
    let res = null;
    try {
      res = await api.rejectPayment(codeOrId, reason);
    } catch (firstErr) {
      const target = bookingIdFallback || codeOrId;
      res = await api.cancelBooking(target, `Transferencia rechazada: ${reason}`);
    }
    if (typeof loadNotificationHistory === 'function') loadNotificationHistory();
    return res;
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
      const st = BOOKING_STATUS_MAP[b.status] || { label: b.status, color: 'var(--editorial-text-main)', bg: '#F2EFE9' };

      let actionsHtml = '';
      if (b.status === 'CONFIRMED') {
        actionsHtml = `
          <button class="btn-checkin-action" data-id="${b.id}" data-code="${b.bookingCode}"
            style="padding: 5px 11px; font-size: 0.75rem; border-radius: 6px; background: rgba(19, 51, 46, 0.08); border: 1px solid var(--editorial-emerald); color: var(--editorial-emerald); cursor: pointer; font-weight: 700;">
            Check-In
          </button>
        `;
      } else if (b.status === 'CHECKED_IN') {
        actionsHtml = `
          <button class="btn-checkout-action" data-id="${b.id}" data-code="${b.bookingCode}"
            style="padding: 5px 11px; font-size: 0.75rem; border-radius: 6px; background: rgba(166, 138, 86, 0.14); border: 1px solid var(--editorial-gold); color: #8C703E; cursor: pointer; font-weight: 700;">
            Check-Out
          </button>
        `;
      } else if (b.status === 'PENDING_PAYMENT') {
        actionsHtml = `
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn-approve-booking-action" data-code="${b.bookingCode}" data-id="${b.id}"
              style="padding: 5px 10px; font-size: 0.74rem; border-radius: 6px; background: var(--editorial-emerald); border: 1px solid var(--editorial-emerald); color: #FAF9F6; cursor: pointer; font-weight: 600;" title="Aceptar y autorizar reserva">
              Aceptar
            </button>
            <button class="btn-reject-booking-action" data-code="${b.bookingCode}" data-id="${b.id}"
              style="padding: 5px 10px; font-size: 0.74rem; border-radius: 6px; background: rgba(180, 35, 24, 0.08); border: 1px solid rgba(180, 35, 24, 0.3); color: #B42318; cursor: pointer; font-weight: 600;" title="Rechazar y liberar habitación">
              Rechazar
            </button>
            <a href="https://api.whatsapp.com/send?phone=${OFFICIAL_WHATSAPP_NUMBER}&text=${encodeURIComponent('Hola ' + (b.userName || 'huésped') + ', nos comunicamos de Travel & Resorts respecto a la validación de pago de su reserva ' + b.bookingCode + ' en ' + b.hotelName)}"
              target="_blank" rel="noopener"
              style="padding: 5px 10px; font-size: 0.74rem; border-radius: 6px; background: #F2EFE9; border: 1px solid var(--editorial-border); color: var(--editorial-emerald); text-decoration: none; font-weight: 600;" title="Gestionar por WhatsApp (304 659 8870)">
              WhatsApp
            </a>
          </div>
        `;
      } else {
        actionsHtml = `<span style="font-size: 0.75rem; color: var(--text-dim);">Sin acciones pendientes</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid var(--editorial-border);">
          <td style="padding: 0.75rem; font-weight: 700; color: var(--editorial-emerald);">${b.bookingCode}</td>
          <td style="padding: 0.75rem;">
            <div style="font-weight: 600; color: var(--editorial-text-main);">${b.userName || 'Huésped'}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${b.userEmail}</div>
          </td>
          <td style="padding: 0.75rem;">
            <div style="font-size: 0.85rem; color: var(--editorial-text-main); font-weight: 500;">${b.hotelName}</div>
            <div style="font-size: 0.75rem; color: var(--editorial-text-muted);">${b.roomName}</div>
          </td>
          <td style="padding: 0.75rem; font-size: 0.8rem; color: var(--editorial-text-muted);">
            <div>In: <strong style="color: var(--editorial-emerald);">${b.checkIn}</strong></div>
            <div>Out: <strong style="color: #8C703E;">${b.checkOut}</strong></div>
          </td>
          <td style="padding: 0.75rem;">
            <span style="font-size: 0.72rem; padding: 3px 9px; border-radius: 999px; background: ${st.bg}; color: ${st.color}; font-weight: 600; border: 1px solid ${st.color}33;">
              ${st.label}
            </span>
          </td>
          <td style="padding: 0.75rem; font-weight: 700; color: var(--editorial-emerald);">
            ${formatCOP(b.totalAmount)}
          </td>
          <td style="padding: 0.75rem;">
            ${actionsHtml}
          </td>
        </tr>
      `;
    }).join('');

    // Eventos de botones de recepción con diálogos editoriales modernos
    document.querySelectorAll('.btn-checkin-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const code = btn.getAttribute('data-code');
        const ok = await openEditorialDialog({
          variant: 'emerald',
          eyebrow: 'RECEPCIÓN & FAST CHECK-IN',
          title: `Registrar Check-In (${code})`,
          subtitle: '¿Confirmas la llegada física del huésped a la propiedad para iniciar su estancia?',
          confirmText: 'Registrar Entrada',
        });
        if (!ok) return;

        try {
          showToast(`Registrando Check-In para ${code}...`, 'info');
          await api.checkInBooking(id);
          showToast(`¡Check-In registrado exitosamente para ${code}!`, 'success');
          loadReceptionBookings();
          loadAdminDashboard();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-approve-booking-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        const id = btn.getAttribute('data-id');
        const bObj = bookings.find(x => x.bookingCode === code) || {};
        const ok = await openEditorialDialog({
          variant: 'emerald',
          eyebrow: 'AUTORIZACIÓN DE PAGO & RESERVA',
          title: `Aprobar Reserva ${code}`,
          subtitle: 'Se confirmará la estancia de manera definitiva y se bloquearán las fechas en inventario.',
          metaHtml: `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Huésped:</span><strong>${bObj.userName || 'Huésped'} (${bObj.userEmail || ''})</strong></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Propiedad:</span><strong>${bObj.hotelName || ''}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Valor Total:</span><strong style="color:var(--editorial-emerald);">${formatCOP(bObj.totalAmount || 0)}</strong></div>
          `,
          emailNotice: `Se enviará un correo de confirmación con el Voucher PDF oficial y código QR a ${bObj.userEmail || 'el huésped'}.`,
          confirmText: 'Autorizar y Enviar Voucher',
        });
        if (!ok) return;

        try {
          showToast(`Autorizando reserva ${code} y enviando correo con Voucher PDF...`, 'info');
          const res = await approveReservationUnified(code, id);
          const previewUrl = res?.notification?.previewUrl;
          showToast(
            `Reserva ${code} confirmada. Correo con Voucher PDF enviado a ${bObj.userEmail || 'huésped'}.`,
            'success',
            previewUrl ? { actionUrl: previewUrl, actionText: 'Ver Correo Enviado' } : {}
          );
          loadReceptionBookings();
          loadAdminDashboard();
          loadPayments();
        } catch (err) {
          showToast(`Error al autorizar: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-reject-booking-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        const id = btn.getAttribute('data-id');
        const bObj = bookings.find(x => x.bookingCode === code) || {};
        const reason = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'RECHAZO DE SOLICITUD & LIBERACIÓN',
          title: `Rechazar Reserva ${code}`,
          subtitle: 'Selecciona o escribe el motivo del rechazo. Las fechas quedarán disponibles de inmediato.',
          metaHtml: `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Huésped:</span><strong>${bObj.userName || 'Huésped'} (${bObj.userEmail || ''})</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Propiedad:</span><strong>${bObj.hotelName || ''} — ${bObj.roomName || ''}</strong></div>
          `,
          requireInput: true,
          inputLabel: 'Motivo del rechazo (se enviará al correo del huésped):',
          defaultValue: 'Comprobante bancario no recibido o fondos no acreditados',
          quickReasons: [
            'Comprobante no recibido en WhatsApp',
            'Fondos no acreditados en cuenta',
            'Referencia bancaria ilegible o inválida',
            'Cancelación solicitada por el huésped',
          ],
          emailNotice: `Se enviará notificación inmediata del rechazo por correo electrónico a ${bObj.userEmail || 'el huésped'}.`,
          confirmText: 'Rechazar y Notificar',
        });
        if (!reason) return;

        try {
          showToast(`Rechazando reserva ${code} y notificando por correo...`, 'info');
          const res = await rejectReservationUnified(code, reason, id);
          const previewUrl = res?.notification?.previewUrl;
          showToast(
            `Reserva ${code} rechazada y fechas liberadas. Correo enviado a ${bObj.userEmail || 'huésped'}.`,
            'info',
            previewUrl ? { actionUrl: previewUrl, actionText: 'Ver Correo Enviado' } : {}
          );
          loadReceptionBookings();
          loadAdminDashboard();
          loadPayments();
        } catch (err) {
          showToast(`Error al rechazar: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-checkout-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const code = btn.getAttribute('data-code');
        const ok = await openEditorialDialog({
          variant: 'gold',
          eyebrow: 'FINALIZACIÓN DE ESTANCIA',
          title: `Registrar Check-Out (${code})`,
          subtitle: '¿Confirmas la salida del huésped para finalizar la estancia y habilitar la suite en inventario?',
          confirmText: 'Completar Check-Out',
        });
        if (!ok) return;

        try {
          showToast(`Registrando Check-Out para ${code}...`, 'info');
          await api.checkOutBooking(id);
          showToast(`¡Check-Out completado con éxito para ${code}!`, 'success');
          loadReceptionBookings();
          loadAdminDashboard();
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
    GUEST: { label: 'Cliente / Huésped', color: '#13332E', bg: 'rgba(19, 51, 46, 0.08)' },
    HOTEL_ADMIN: { label: 'Administrador', color: '#8C703E', bg: 'rgba(166, 138, 86, 0.14)' },
  };

  // =========================================================================
  // FASE 4: PANEL DE CONTROL & TRANSACCIONES (ADMIN DASHBOARD SINCRONIZADO)
  // =========================================================================
  async function loadAdminDashboard() {
    try {
      // 1. Cargar en paralelo Habitaciones, Reservas, Pagos y Usuarios para que las métricas sean 100% coherentes
      const [roomsRes, bookingsRes, paymentsRes, usersRes] = await Promise.all([
        api.getRooms({ limit: 100 }).catch(() => ({ data: [] })),
        api.getAllBookings({ limit: 100 }).catch(() => ({ data: [] })),
        api.getAllPayments({ limit: 100 }).catch(() => ({ data: [] })),
        api.getAllUsers().catch(() => []),
      ]);

      const rooms = Array.isArray(roomsRes) ? roomsRes : (roomsRes?.data || []);
      const bookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes?.data || []);
      const payments = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes?.data || []);
      const users = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);

      // 2. Calcular Ocupación real (Habitaciones en estado OCCUPIED + Habitaciones con reserva activa CONFIRMED o CHECKED_IN)
      const activeBookedRoomIds = new Set(
        bookings
          .filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
          .map(b => b.roomId)
          .filter(Boolean)
      );

      const totalRooms = rooms.length;
      const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length;
      const inactiveRooms = rooms.filter(r => r.status === 'INACTIVE' || r.isActive === false).length;
      const occupiedRoomsCount = rooms.filter(
        r => r.status === 'OCCUPIED' || activeBookedRoomIds.has(r.id)
      ).length;
      const availableRooms = Math.max(0, totalRooms - occupiedRoomsCount - maintenanceRooms - inactiveRooms);

      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 0;

      const elOccRate = document.getElementById('kpiOccupancyRate');
      const elOccDetail = document.getElementById('kpiOccupancyDetail');
      if (elOccRate) elOccRate.textContent = `${occupancyRate}%`;
      if (elOccDetail) elOccDetail.textContent = `${occupiedRoomsCount} de ${totalRooms} habitaciones con estancia activa`;

      const elAvail = document.getElementById('invAvailableCount');
      const elOcc = document.getElementById('invOccupiedCount');
      const elMaint = document.getElementById('invMaintenanceCount');
      const elInact = document.getElementById('invInactiveCount');
      if (elAvail) elAvail.textContent = availableRooms;
      if (elOcc) elOcc.textContent = occupiedRoomsCount;
      if (elMaint) elMaint.textContent = maintenanceRooms;
      if (elInact) elInact.textContent = inactiveRooms;

      // 3. Calcular Ingresos Confirmados (Unificando reservas CONFIRMED / CHECKED_IN / COMPLETED y pagos SUCCEEDED sin duplicar por bookingCode)
      const revenueByBookingCode = new Map();
      bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED')
        .forEach(b => {
          revenueByBookingCode.set(b.bookingCode || b.id, getCOPPrice(b.totalAmount) || 0);
        });
      payments
        .filter(p => p.status === 'SUCCEEDED' || p.status === 'COMPLETED')
        .forEach(p => {
          const key = p.bookingCode || p.bookingId || p.id;
          if (!revenueByBookingCode.has(key)) {
            revenueByBookingCode.set(key, getCOPPrice(p.amount) || 0);
          }
        });

      let totalRevenue = 0;
      revenueByBookingCode.forEach(val => { totalRevenue += val; });

      const elRev = document.getElementById('kpiTotalRevenue');
      if (elRev) elRev.textContent = formatCOP(totalRevenue);

      // 4. Unificar Solicitudes de Reserva y Transferencias Pendientes de Aprobación (PENDING_PAYMENT + PENDING)
      const pendingMap = new Map();

      // Primero todas las reservas en estado PENDING_PAYMENT (fuente de verdad de las reservas pendientes)
      bookings
        .filter(b => b.status === 'PENDING_PAYMENT')
        .forEach(b => {
          pendingMap.set(b.bookingCode, {
            id: b.bookingCode,
            bookingId: b.id,
            bookingCode: b.bookingCode,
            userName: b.userName || 'Huésped',
            userEmail: b.userEmail || '',
            hotelName: b.hotelName || 'Sede Hotelera',
            roomName: b.roomName || 'Suite',
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            amount: b.totalAmount,
            createdAt: b.createdAt,
            transferReference: `WA-CHAT-${b.bookingCode}`,
          });
        });

      // Agregar pagos en estado PENDING cuya reserva siga pendiente
      const cancelledOrConfirmedCodes = new Set(
        bookings
          .filter(b => b.status !== 'PENDING_PAYMENT')
          .map(b => b.bookingCode)
      );

      payments
        .filter(p => p.status === 'PENDING')
        .forEach(p => {
          const code = p.bookingCode || p.id;
          if (cancelledOrConfirmedCodes.has(code)) return;
          if (!pendingMap.has(code)) {
            pendingMap.set(code, {
              id: p.bookingCode || p.id,
              bookingId: p.bookingId,
              bookingCode: p.bookingCode || p.id?.substring(0, 8),
              userName: p.userEmail ? p.userEmail.split('@')[0] : 'Huésped',
              userEmail: p.userEmail || '',
              hotelName: 'Gestión Directa WhatsApp',
              roomName: p.cardBrand || 'Transferencia Bancaria',
              amount: p.amount,
              createdAt: p.createdAt,
              transferReference: p.transactionReference || p.transferReference || `WA-CHAT-${code}`,
            });
          } else {
            const existing = pendingMap.get(code);
            existing.transferReference = p.transactionReference || p.transferReference || existing.transferReference;
          }
        });

      const unifiedPendingList = Array.from(pendingMap.values());

      const elPendingKpi = document.getElementById('kpiPendingTransfers');
      if (elPendingKpi) elPendingKpi.textContent = unifiedPendingList.length;

      renderDashboardPendingTransfers(unifiedPendingList);

      // 5. Huéspedes registrados
      const guests = users.filter(u => u.role === 'GUEST');
      const elGuests = document.getElementById('kpiTotalGuests');
      if (elGuests) elGuests.textContent = guests.length;

    } catch (err) {
      console.warn('Error calculando métricas del dashboard:', err.message);
    }
  }

  function renderDashboardPendingTransfers(pendingList = []) {
    const box = document.getElementById('dashboardPendingTransfersBox');
    if (!box) return;

    if (pendingList.length === 0) {
      box.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--editorial-emerald); background: rgba(19, 51, 46, 0.04); border-radius: 8px; border: 1px dashed rgba(19, 51, 46, 0.2);">
          <span>No hay solicitudes ni transferencias pendientes por aprobar en este momento. Todas las reservas están al día.</span>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="table-responsive">
        <table class="reception-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Código Reserva</th>
              <th>Huésped</th>
              <th>Hotel &amp; Habitación</th>
              <th>Monto</th>
              <th>Canal / Referencia</th>
              <th>Acción Rápida</th>
            </tr>
          </thead>
          <tbody>
            ${pendingList.map(p => `
              <tr style="border-bottom: 1px solid var(--editorial-border);">
                <td style="padding: 0.75rem;">
                  <div style="font-weight: 700; color: var(--editorial-emerald);">${p.bookingCode}</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Hoy'}</div>
                </td>
                <td style="padding: 0.75rem;">
                  <div style="font-weight: 600; color: var(--editorial-text-main);">${p.userName || 'Huésped'}</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">${p.userEmail || ''}</div>
                </td>
                <td style="padding: 0.75rem;">
                  <div style="font-size: 0.84rem; color: var(--editorial-text-main); font-weight: 500;">${p.hotelName || 'Sede Hotelera'}</div>
                  <div style="font-size: 0.74rem; color: var(--editorial-text-muted);">${p.roomName || ''} ${p.checkIn ? `(${p.checkIn} → ${p.checkOut})` : ''}</div>
                </td>
                <td style="padding: 0.75rem; font-weight: 700; color: var(--editorial-emerald);">
                  ${formatCOP(p.amount)}
                </td>
                <td style="padding: 0.75rem; font-size: 0.78rem; color: #8C703E; font-weight: 600;">
                  <div>${p.transferReference || 'WhatsApp Directo'}</div>
                  <div style="font-size: 0.7rem; color: var(--editorial-text-subtle);">WhatsApp: ${OFFICIAL_WHATSAPP_DISPLAY}</div>
                </td>
                <td style="padding: 0.75rem;">
                  <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <button class="btn-dash-approve" data-code="${p.bookingCode}" data-booking-id="${p.bookingId || ''}"
                      style="padding: 5px 10px; font-size: 0.74rem; border-radius: 6px; background: var(--editorial-emerald); border: 1px solid var(--editorial-emerald); color: #FAF9F6; cursor: pointer; font-weight: 600;">
                      Aprobar
                    </button>
                    <button class="btn-dash-reject" data-code="${p.bookingCode}" data-booking-id="${p.bookingId || ''}"
                      style="padding: 5px 10px; font-size: 0.74rem; border-radius: 6px; background: rgba(180, 35, 24, 0.08); border: 1px solid rgba(180, 35, 24, 0.3); color: #B42318; cursor: pointer; font-weight: 600;">
                      Rechazar
                    </button>
                    <a href="https://api.whatsapp.com/send?phone=${OFFICIAL_WHATSAPP_NUMBER}&text=${encodeURIComponent('Hola ' + (p.userName || 'huésped') + ', nos comunicamos de Travel & Resorts sobre la reserva ' + p.bookingCode)}"
                      target="_blank" rel="noopener"
                      style="padding: 5px 10px; font-size: 0.74rem; border-radius: 6px; background: #F2EFE9; border: 1px solid var(--editorial-border); color: var(--editorial-emerald); text-decoration: none; font-weight: 600;">
                      WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    box.querySelectorAll('.btn-dash-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        const bookingId = btn.getAttribute('data-booking-id');
        const pObj = pendingList.find(x => x.bookingCode === code) || {};
        const ok = await openEditorialDialog({
          variant: 'emerald',
          eyebrow: 'AUTORIZACIÓN EJECUTIVA DE PAGO',
          title: `Aprobar Reserva ${code}`,
          subtitle: 'Se validará el pago reportado, confirmando la reserva y bloqueando las fechas.',
          metaHtml: `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Huésped:</span><strong>${pObj.userName || 'Huésped'} (${pObj.userEmail || ''})</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Monto:</span><strong style="color:var(--editorial-emerald);">${formatCOP(pObj.amount || 0)}</strong></div>
          `,
          emailNotice: `Se enviará el correo de confirmación con el Voucher PDF oficial a ${pObj.userEmail || 'el huésped'}.`,
          confirmText: 'Aprobar y Enviar Correo',
        });
        if (!ok) return;
        try {
          showToast(`Autorizando reserva ${code} y despachando Voucher PDF...`, 'info');
          const res = await approveReservationUnified(code, bookingId);
          const previewUrl = res?.notification?.previewUrl;
          showToast(
            `Reserva ${code} aprobada. Correo con Voucher PDF enviado a ${pObj.userEmail || 'huésped'}.`,
            'success',
            previewUrl ? { actionUrl: previewUrl, actionText: 'Ver Correo Enviado' } : {}
          );
          loadAdminDashboard();
          loadReceptionBookings();
          loadPayments();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    box.querySelectorAll('.btn-dash-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        const bookingId = btn.getAttribute('data-booking-id');
        const pObj = pendingList.find(x => x.bookingCode === code) || {};
        const reason = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'RECHAZO DE TRANSFERENCIA',
          title: `Rechazar Reserva ${code}`,
          subtitle: 'Indica el motivo por el cual no se aprueba el pago. Se liberarán las fechas de inmediato.',
          requireInput: true,
          inputLabel: 'Motivo del rechazo (se enviará por correo al huésped):',
          defaultValue: 'Comprobante bancario no legible o fondos no acreditados',
          quickReasons: [
            'Comprobante no recibido en WhatsApp',
            'Fondos no acreditados en cuenta',
            'Referencia bancaria inválida',
            'Solicitud cancelada por el cliente',
          ],
          emailNotice: `Se notificará inmediatamente por correo electrónico a ${pObj.userEmail || 'el huésped'}.`,
          confirmText: 'Rechazar y Notificar',
        });
        if (!reason) return;
        try {
          showToast(`Rechazando reserva ${code} y enviando correo...`, 'info');
          const res = await rejectReservationUnified(code, reason, bookingId);
          const previewUrl = res?.notification?.previewUrl;
          showToast(
            `Reserva ${code} rechazada y fechas liberadas. Correo enviado a ${pObj.userEmail || 'huésped'}.`,
            'info',
            previewUrl ? { actionUrl: previewUrl, actionText: 'Ver Correo Enviado' } : {}
          );
          loadAdminDashboard();
          loadReceptionBookings();
          loadPayments();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  }

  const refreshAdminDashboardBtn = document.getElementById('refreshAdminDashboardBtn');
  refreshAdminDashboardBtn?.addEventListener('click', () => {
    showToast('Actualizando métricas...', 'info');
    loadAdminDashboard();
  });

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
        <tr><td colspan="6" style="text-align: center; color: #B42318; padding: 2rem;">Error cargando usuarios: ${err.message}</td></tr>
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
      const rl = ROLE_LABELS[u.role] || { label: u.role, color: 'var(--editorial-text-main)', bg: '#F2EFE9' };
      const activeBadge = u.isActive
        ? `<span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: rgba(19, 51, 46, 0.08); color: var(--editorial-emerald); font-weight: 700;">Activa</span>`
        : `<span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: rgba(180, 35, 24, 0.08); color: #B42318; font-weight: 700;">Desactivada</span>`;

      let actions = '';
      if (u.role !== 'HOTEL_ADMIN') {
        actions += `
          <button class="btn-user-toggle" data-id="${u.id}" data-active="${u.isActive}"
            style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 600;
              background: rgba(166, 138, 86, 0.12); border: 1px solid var(--editorial-gold); color: #8C703E;">
            ${u.isActive ? 'Desactivar' : 'Activar'}
          </button>
        `;
      }
      if (u.role === 'GUEST') {
        actions += `
          <button class="btn-user-delete" data-id="${u.id}" data-email="${u.email}"
            style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 600;
              background: rgba(180, 35, 24, 0.08); border: 1px solid rgba(180, 35, 24, 0.3); color: #B42318;">
            Eliminar
          </button>
        `;
      }

      return `
        <tr style="border-bottom: 1px solid var(--editorial-border);">
          <td style="padding: 0.75rem;">
            <div style="font-weight: 600; color: var(--editorial-text-main);">${u.firstName} ${u.lastName}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">ID: ${u.id?.substring(0, 8)}…</div>
          </td>
          <td style="padding: 0.75rem; font-size: 0.82rem; color: var(--editorial-text-muted);">${u.email}</td>
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
        const ok = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'ADMINISTRACIÓN DE CUENTAS',
          title: 'Eliminar Cuenta de Usuario',
          subtitle: `¿Confirmas que deseas eliminar definitivamente la cuenta ${email}? El correo quedará libre para futuros registros.`,
          confirmText: 'Eliminar Cuenta',
        });
        if (!ok) return;
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
      showToast(`Cuenta ${res.user?.role} creada para ${res.user?.email}`, 'success');
      createStaffForm.reset();
      loadUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      if (submitStaffBtn) {
        submitStaffBtn.disabled = false;
        submitStaffBtn.innerHTML = '<span>Crear Cuenta</span>';
      }
    }
  });

  refreshUsersBtn?.addEventListener('click', () => {
    loadUsers();
    showToast('Listado de cuentas actualizado', 'info');
  });

  const btnDeleteGuests = document.getElementById('btnDeleteGuests');
  btnDeleteGuests?.addEventListener('click', async () => {
    const ok = await openEditorialDialog({
      variant: 'danger',
      eyebrow: 'DEPURACIÓN DE DIRECTORIO',
      title: 'Eliminar Cuentas de Huéspedes (GUEST)',
      subtitle: 'Se eliminarán todas las cuentas de prueba con rol Huésped, conservando intacta la cuenta del Administrador.',
      confirmText: 'Confirmar Depuración',
    });
    if (!ok) return;
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
    COMPLETED: { label: 'Completado', color: '#13332E', bg: 'rgba(19, 51, 46, 0.08)' },
    SUCCEEDED: { label: 'Completado', color: '#13332E', bg: 'rgba(19, 51, 46, 0.08)' },
    PENDING: { label: 'Pendiente de Aprobación', color: '#8C703E', bg: 'rgba(166, 138, 86, 0.14)' },
    FAILED: { label: 'Rechazado / Fallido', color: '#B42318', bg: 'rgba(180, 35, 24, 0.08)' },
    REFUNDED: { label: 'Reembolsado', color: '#6E6B64', bg: '#F2EFE9' },
  };

  async function buildUnifiedPaymentsList(onlyPending = false) {
    const [paymentsRes, bookingsRes] = await Promise.all([
      onlyPending ? api.getPendingPayments().catch(() => []) : api.getAllPayments({ limit: 100 }).catch(() => ({ data: [] })),
      api.getAllBookings({ limit: 100 }).catch(() => ({ data: [] })),
    ]);

    const rawPayments = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes?.data || []);
    const rawBookings = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes?.data || []);

    const byCode = new Map();
    rawPayments.forEach(p => {
      const key = p.bookingCode || p.id;
      byCode.set(key, {
        ...p,
        paymentReference: p.transactionReference || p.paymentReference || p.reference || `WA-CHAT-${p.bookingCode || ''}`,
        bookingCode: p.bookingCode || p.bookingId,
        method: p.cardBrand || p.paymentMethod || 'Transferencia / WhatsApp',
      });
    });

    rawBookings.forEach(b => {
      if (onlyPending && b.status !== 'PENDING_PAYMENT') return;
      if (!byCode.has(b.bookingCode)) {
        const mappedStatus = b.status === 'PENDING_PAYMENT'
          ? 'PENDING'
          : (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED' ? 'SUCCEEDED' : 'FAILED');
        byCode.set(b.bookingCode, {
          id: b.id,
          bookingId: b.id,
          bookingCode: b.bookingCode,
          paymentReference: `WA-CHAT-${b.bookingCode}`,
          method: `WhatsApp (${OFFICIAL_WHATSAPP_DISPLAY})`,
          amount: b.totalAmount,
          status: mappedStatus,
          createdAt: b.createdAt,
        });
      }
    });

    const list = Array.from(byCode.values());
    return onlyPending ? list.filter(item => item.status === 'PENDING') : list;
  }

  async function loadPayments() {
    if (!paymentsTableBody) return;

    paymentsTableBody.innerHTML = `
      <tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 2rem;">Consultando transacciones...</td></tr>
    `;

    try {
      const list = await buildUnifiedPaymentsList(false);
      renderPaymentsTable(list);
    } catch (err) {
      paymentsTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; color: #B42318; padding: 2rem;">Error cargando pagos: ${err.message}</td></tr>
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
      const st = PAYMENT_STATUS_MAP[p.status] || { label: p.status, color: 'var(--editorial-text-main)', bg: '#F2EFE9' };
      const canRefund = p.status === 'COMPLETED' || p.status === 'SUCCEEDED';
      const isPending = p.status === 'PENDING';
      const codeOrRef = p.bookingCode || p.paymentReference || p.id;

      let actionButtons = '<span style="font-size: 0.72rem; color: var(--text-dim);">—</span>';
      if (isPending) {
        actionButtons = `
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn-pay-approve-action" data-code="${p.bookingCode || codeOrRef}" data-booking-id="${p.bookingId || ''}"
              style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 600;
                background: var(--editorial-emerald); border: 1px solid var(--editorial-emerald); color: #FAF9F6;">
              Aprobar
            </button>
            <button class="btn-pay-reject-action" data-code="${p.bookingCode || codeOrRef}" data-booking-id="${p.bookingId || ''}"
              style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 600;
                background: rgba(180, 35, 24, 0.08); border: 1px solid rgba(180, 35, 24, 0.3); color: #B42318;">
              Rechazar
            </button>
          </div>
        `;
      } else if (canRefund) {
        actionButtons = `
          <button class="btn-refund-action" data-ref="${codeOrRef}"
            style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; cursor: pointer; font-weight: 600;
              background: #F2EFE9; border: 1px solid var(--editorial-border); color: var(--editorial-text-main);">
            Reembolsar
          </button>
        `;
      }

      return `
        <tr style="border-bottom: 1px solid var(--editorial-border);">
          <td style="padding: 0.75rem; font-weight: 700; color: var(--editorial-emerald);">${p.paymentReference || p.transactionReference || p.id?.substring(0, 8)}</td>
          <td style="padding: 0.75rem; font-size: 0.82rem; font-weight: 600; color: var(--editorial-text-main);">${p.bookingCode || p.bookingId || '—'}</td>
          <td style="padding: 0.75rem; font-size: 0.8rem; color: var(--editorial-text-muted);">${p.method || p.cardBrand || p.paymentMethod || '—'}</td>
          <td style="padding: 0.75rem; font-weight: 700; color: var(--editorial-emerald);">
            ${formatCOP(p.amount || p.totalAmount || 0)}
          </td>
          <td style="padding: 0.75rem;">
            <span style="font-size: 0.72rem; padding: 3px 9px; border-radius: 999px; background: ${st.bg}; color: ${st.color}; font-weight: 600; border: 1px solid ${st.color}33;">
              ${st.label}
            </span>
          </td>
          <td style="padding: 0.75rem; font-size: 0.75rem; color: var(--text-dim);">${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
          <td style="padding: 0.75rem;">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-pay-approve-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        const bookingId = btn.getAttribute('data-booking-id');
        const ok = await openEditorialDialog({
          variant: 'emerald',
          eyebrow: 'CONCILIACIÓN FINANCIERA',
          title: `Aprobar Pago (${code})`,
          subtitle: '¿Confirmas la recepción de los fondos para aprobar la transacción y emitir el Voucher oficial?',
          emailNotice: 'Se enviará notificación de pago aceptado y Voucher PDF al correo del huésped.',
          confirmText: 'Aprobar Transacción',
        });
        if (!ok) return;
        try {
          showToast(`Autorizando ${code}...`, 'info');
          const res = await approveReservationUnified(code, bookingId);
          const previewUrl = res?.notification?.previewUrl;
          showToast(
            `Reserva ${code} autorizada y correo enviado al huésped.`,
            'success',
            previewUrl ? { actionUrl: previewUrl, actionText: 'Ver Correo Enviado' } : {}
          );
          loadPayments();
          loadAdminDashboard();
          loadReceptionBookings();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-pay-reject-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        const bookingId = btn.getAttribute('data-booking-id');
        const reason = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'CONCILIACIÓN FINANCIERA',
          title: `Rechazar Pago (${code})`,
          subtitle: 'Indica el motivo del rechazo para cancelar la solicitud y notificar al cliente.',
          requireInput: true,
          inputLabel: 'Motivo del rechazo:',
          defaultValue: 'Comprobante bancario no acreditado',
          quickReasons: [
            'Comprobante no recibido',
            'Fondos no acreditados',
            'Referencia inválida',
          ],
          emailNotice: 'Se enviará notificación inmediata del rechazo al correo del huésped.',
          confirmText: 'Rechazar Pago',
        });
        if (!reason) return;
        try {
          showToast(`Rechazando ${code}...`, 'info');
          const res = await rejectReservationUnified(code, reason, bookingId);
          const previewUrl = res?.notification?.previewUrl;
          showToast(
            `Reserva ${code} rechazada y correo enviado al huésped.`,
            'info',
            previewUrl ? { actionUrl: previewUrl, actionText: 'Ver Correo Enviado' } : {}
          );
          loadPayments();
          loadAdminDashboard();
          loadReceptionBookings();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-refund-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ref = btn.getAttribute('data-ref');
        const reason = await openEditorialDialog({
          variant: 'gold',
          eyebrow: 'REVERSIÓN FINANCIERA',
          title: `Reembolsar Transacción (${ref})`,
          subtitle: 'Indica el motivo del reembolso para generar el comprobante oficial.',
          requireInput: true,
          inputLabel: 'Motivo del reembolso:',
          defaultValue: 'Reembolso autorizado por administración a solicitud del huésped',
          quickReasons: [
            'Cancelación dentro del plazo flexible',
            'Ajuste de tarifa autorizado',
            'Solicitud directa del huésped',
          ],
          emailNotice: 'Se enviará el comprobante de reembolso al correo electrónico del huésped.',
          confirmText: 'Procesar Reembolso',
        });
        if (!reason) return;
        try {
          showToast(`Procesando reembolso de ${ref}...`, 'info');
          await api.refundPayment(ref, reason);
          showToast(`Reembolso procesado para ${ref}`, 'success');
          loadPayments();
          loadAdminDashboard();
          if (typeof loadNotificationHistory === 'function') loadNotificationHistory();
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });
  }

  filterPaymentsAllBtn?.addEventListener('click', () => {
    filterPaymentsAllBtn.classList.add('active-filter');
    filterPaymentsPendingBtn?.classList.remove('active-filter');
    loadPayments();
  });

  filterPaymentsPendingBtn?.addEventListener('click', async () => {
    filterPaymentsPendingBtn.classList.add('active-filter');
    filterPaymentsAllBtn?.classList.remove('active-filter');
    try {
      showToast('Filtrando solicitudes y transferencias pendientes...', 'info');
      const pending = await buildUnifiedPaymentsList(true);
      renderPaymentsTable(pending || []);
    } catch (err) {
      showToast(`Error al consultar pendientes: ${err.message}`, 'error');
    }
  });

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

      // Actualizar píldora de estado de SMTP (Gmail Real vs Sandbox)
      api.getNotificationStatus().then(st => {
        const textElem = document.getElementById('notifSmtpPillText');
        const pillElem = document.getElementById('notifSmtpPill');
        const btnOpenSmtp = document.getElementById('btnOpenSmtpConfig');
        if (textElem && st?.smtp) {
          if (st.smtp.isReal) {
            textElem.textContent = st.smtp.provider || 'Gmail SMTP Oficial (Activo)';
            if (pillElem) pillElem.style.borderColor = 'var(--editorial-emerald)';
            if (btnOpenSmtp) btnOpenSmtp.style.display = isStaff ? 'inline-flex' : 'none';
          } else {
            textElem.textContent = 'Modo Previsualización (Clic para activar Gmail Real)';
            if (btnOpenSmtp) btnOpenSmtp.style.display = isStaff ? 'inline-flex' : 'none';
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
        ? `<span style="color: var(--editorial-emerald); font-size: 0.72rem; font-weight:600;">✓ Entregado a Gmail</span>`
        : '';
      const previewLink = item.previewUrl
        ? `<a href="${item.previewUrl}" target="_blank" class="notif-link-btn" title="Abrir correo renderizado en Ethereal">Ver Email</a>`
        : deliveryBadge;
      const attachmentBadge = item.hasAttachment
        ? `<span style="color:#6ee7b7; font-size: 0.72rem;">Voucher PDF</span>`
        : '';

      return `
        <div class="notif-history-item">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="notif-badge-tag ${item.type || ''}">${item.type || 'EVENT'}</span>
            <strong style="color: var(--editorial-text-main);">${item.recipient || '—'}</strong>
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

  // Controlador del Modal de Configuración de Gmail SMTP Real
  const smtpConfigModal = document.getElementById('smtpConfigModal');
  const btnOpenSmtpConfig = document.getElementById('btnOpenSmtpConfig');
  const closeSmtpConfigModalBtn = document.getElementById('closeSmtpConfigModalBtn');
  const cancelSmtpConfigBtn = document.getElementById('cancelSmtpConfigBtn');
  const smtpConfigForm = document.getElementById('smtpConfigForm');
  const notifSmtpPill = document.getElementById('notifSmtpPill');

  function openSmtpModal() {
    const u = api.getCurrentUser();
    if (!u || u.role !== 'HOTEL_ADMIN') return;
    if (smtpConfigModal) smtpConfigModal.style.display = 'flex';
  }

  btnOpenSmtpConfig?.addEventListener('click', openSmtpModal);
  notifSmtpPill?.addEventListener('click', openSmtpModal);
  closeSmtpConfigModalBtn?.addEventListener('click', () => {
    if (smtpConfigModal) smtpConfigModal.style.display = 'none';
  });
  cancelSmtpConfigBtn?.addEventListener('click', () => {
    if (smtpConfigModal) smtpConfigModal.style.display = 'none';
  });
  smtpConfigModal?.addEventListener('click', (e) => {
    if (e.target === smtpConfigModal) smtpConfigModal.style.display = 'none';
  });

  smtpConfigForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('smtpConfigUser')?.value.trim();
    const pass = document.getElementById('smtpConfigPass')?.value.trim();
    const submitBtn = document.getElementById('submitSmtpConfigBtn');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Verificando con Google SMTP...</span>';
    }

    try {
      const res = await api.configureSmtp(user, pass);
      showToast(res.message || `Gmail SMTP activado (${user}). Ahora todos los correos llegarán a la bandeja real.`, 'success');
      if (smtpConfigModal) smtpConfigModal.style.display = 'none';
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error autenticando Gmail SMTP: ${err.message}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Verificar y Activar Gmail Real</span>';
      }
    }
  });

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
          <span style="color: #B42318;">Error al consultar habitaciones: ${err.message}</span>
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

    roomsGrid.innerHTML = rooms.map((r, idx) => {
      const img = (Array.isArray(r.images) && r.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';
      const typeLabel = ROOM_TYPE_NAMES[r.roomType] || r.roomType;
      const amenities = (r.amenities || []).slice(0, 4).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('');

      const adminButtons = isAdmin ? `
        <div class="hotel-admin-actions">
          <button class="btn-card-delete btn-room-delete" data-id="${r.id}" data-name="${r.name}" title="Dar de baja habitación">${SVG_ICONS.trash}</button>
        </div>
      ` : '';

      const statusControl = isAdmin ? `
        <div style="display:flex; align-items:center; gap:0.35rem;">
          <span style="font-size:0.72rem; color:var(--editorial-text-subtle);">Estado:</span>
          <select class="room-status-select filter-select" data-id="${r.id}" style="height: 32px; padding: 0 0.65rem; font-size: 0.75rem;">
            <option value="AVAILABLE" ${r.status === 'AVAILABLE' ? 'selected' : ''}>Disponible</option>
            <option value="OCCUPIED" ${r.status === 'OCCUPIED' ? 'selected' : ''}>Ocupada</option>
            <option value="MAINTENANCE" ${r.status === 'MAINTENANCE' ? 'selected' : ''}>Mantenimiento</option>
            <option value="INACTIVE" ${r.status === 'INACTIVE' ? 'selected' : ''}>Inactiva</option>
          </select>
        </div>
      ` : `
        <span class="hotel-policy-pill ${r.status === 'AVAILABLE' ? 'pet-yes' : ''}">
          <span class="dot ${r.status === 'AVAILABLE' ? 'online' : ''}" style="${r.status !== 'AVAILABLE' ? 'background: var(--editorial-danger);' : ''}"></span>
          <span>${r.status === 'AVAILABLE' ? 'Disponible' : 'Ocupada'}</span>
        </span>
      `;

      return `
        <article class="hotel-card" data-id="${r.id}" style="--card-idx: ${idx};">
          <div class="hotel-card-media">
            <img src="${img}" alt="${r.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-city">#${r.roomNumber} · Piso ${r.floor}</div>
            <div class="badge-stars">${typeLabel}</div>
            ${adminButtons}
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${r.name}</h3>
            <div class="hotel-card-location">${SVG_ICONS.building}<span>${r.hotelName}</span></div>
            <p class="hotel-card-desc">${r.description || ''}</p>
            <div style="font-size: 0.78rem; color: var(--editorial-text-muted); margin: 0.25rem 0;">
              ${r.maxAdults} adultos · ${r.bedType} · ${r.sizeSqm} m² · ${r.viewType}
            </div>
            <div class="hotel-amenities-tags">${amenities}</div>
          </div>
          <div class="hotel-card-footer">
            <div>
              <div style="font-family: var(--editorial-font-serif); font-size: 1.15rem; font-weight: 600; color: var(--editorial-emerald);">
                ${formatCOP(r.pricePerNight)} <span style="font-family: var(--editorial-font-sans); font-size: 0.72rem; font-weight: 400; color: var(--editorial-text-subtle);">/ noche</span>
              </div>
              ${statusControl}
            </div>
            <div class="hotel-card-actions">
              <button type="button" class="btn-hotel-detail btn-open-calendar"
                data-room-id="${r.id}"
                data-room-name="${r.name} #${r.roomNumber}"
                data-hotel-name="${r.hotelName}"
                data-hotel-id="${r.hotelId}"
                data-price="${getCOPPrice(r.pricePerNight)}"
                data-max-adults="${r.maxAdults || 2}"
                title="Consultar calendario mensual de fechas y reservar">
                ${SVG_ICONS.calendar}
                <span>Calendario</span>
              </button>
              <button type="button" class="btn-blue btn-book-from-rooms" data-hotel-id="${r.hotelId}">
                <span>Reservar</span>
              </button>
            </div>
          </div>
        </article>
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

    document.querySelectorAll('.btn-room-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditRoomModal(btn.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.btn-room-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const ok = await openEditorialDialog({
          variant: 'danger',
          eyebrow: 'INVENTARIO DE SUITES',
          title: 'Dar de Baja Habitación',
          subtitle: `¿Confirmas que deseas eliminar la habitación "${name}" del inventario?`,
          confirmText: 'Eliminar Habitación',
        });
        if (!ok) return;

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
    const ok = await openEditorialDialog({
      variant: 'emerald',
      eyebrow: 'INVENTARIO DEMOSTRATIVO',
      title: 'Restaurar Suites Oficiales',
      subtitle: 'Se cargarán las habitaciones y suites de lujo en todas las propiedades del catálogo.',
      confirmText: 'Poblar Habitaciones',
    });
    if (!ok) return;
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

  
  async function openEditRoomModal(id) {
    try {
      await loadRoomHotels();
      const room = await api.getRoomById(id);
      document.getElementById('formRoomId').value = room.id;
      document.getElementById('formRoomHotel').value = room.hotelId;
      document.getElementById('formRoomNumber').value = room.roomNumber || '';
      document.getElementById('formRoomFloor').value = room.floor || 1;
      document.getElementById('formRoomTypeSel').value = room.roomType || 'STANDARD';
      document.getElementById('formRoomName').value = room.name || '';
      document.getElementById('formRoomDesc').value = room.description || '';
      document.getElementById('formRoomPrice').value = getCOPPrice(room.pricePerNight);
      document.getElementById('formRoomAdults').value = room.maxAdults || 2;
      document.getElementById('formRoomChildren').value = room.maxChildren || 0;
      if (document.getElementById('formRoomSeason')) document.getElementById('formRoomSeason').value = room.season || 'REGULAR';
      if (document.getElementById('formRoomDiscount')) document.getElementById('formRoomDiscount').value = room.discountPercentage || 0;
      if (document.getElementById('formRoomOfferDesc')) document.getElementById('formRoomOfferDesc').value = room.offerDescription || '';
      document.getElementById('formRoomAmenities').value = Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || '');
      const firstImg = Array.isArray(room.images) ? room.images[0] : (room.images || '');
      document.getElementById('formRoomImg').value = firstImg;
      const rTitle = document.getElementById('roomFormTitle');
      if (rTitle) rTitle.textContent = `Editar Habitación ${room.name} (#${room.roomNumber})`;
      roomFormModal.style.display = 'flex';
    } catch (err) {
      showToast(`Error cargando habitación: ${err.message}`, 'error');
    }
  }

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
        btnProceedBookingFromCalendar.innerHTML = `<span>RESERVAR HABITACIÓN (${nights} ${nights === 1 ? 'NOCHE' : 'NOCHES'} — ${formatCOP(total)})</span>`;
      }
    } else if (calBookingCheckIn && !calBookingCheckOut) {
      if (calClientNightsText) calClientNightsText.textContent = 'Elige salida';
      if (calClientTotalText) calClientTotalText.textContent = `${formatCOP(calSelectedRoomPrice)} / noche`;
      if (btnProceedBookingFromCalendar) {
        btnProceedBookingFromCalendar.disabled = true;
        btnProceedBookingFromCalendar.style.opacity = '0.6';
        btnProceedBookingFromCalendar.style.cursor = 'not-allowed';
        btnProceedBookingFromCalendar.innerHTML = `<span>SELECCIONA EL DÍA DE SALIDA EN EL CALENDARIO</span>`;
      }
    } else {
      if (calClientNightsText) calClientNightsText.textContent = '—';
      if (calClientTotalText) calClientTotalText.textContent = `${formatCOP(calSelectedRoomPrice)} / noche`;
      if (btnProceedBookingFromCalendar) {
        btnProceedBookingFromCalendar.disabled = true;
        btnProceedBookingFromCalendar.style.opacity = '0.6';
        btnProceedBookingFromCalendar.style.cursor = 'not-allowed';
        btnProceedBookingFromCalendar.innerHTML = `<span>SELECCIONA FECHA DE LLEGADA EN EL CALENDARIO</span>`;
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
          badgeHtml = `<span style="font-size: 0.62rem; font-weight: 800; color: var(--editorial-text-main); background: #059669; padding: 1px 6px; border-radius: 4px; margin-top: 2px;">Llegada</span>`;
          extraStyle = 'box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); transform: scale(1.02);';
        } else if (isCheckOut) {
          cellBg = 'rgba(56, 189, 248, 0.35)';
          cellBorder = '#38bdf8';
          badgeHtml = `<span style="font-size: 0.62rem; font-weight: 800; color: var(--editorial-text-main); background: #0284c7; padding: 1px 6px; border-radius: 4px; margin-top: 2px;">Salida</span>`;
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
            <span style="font-weight: 800; font-size: 0.82rem; color: var(--editorial-text-main);">${d.day}</span>
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
            showToast(`Check-In: ${selectedDate}. Ahora haz clic en tu fecha de salida (Check-Out).`, 'info');
          } else if (calSelectionStep === 1) {
            if (selectedDate <= calBookingCheckIn) {
              calBookingCheckIn = selectedDate;
              calBookingCheckOut = null;
              calSelectionStep = 1;
              showToast(`Nueva fecha de Check-In: ${selectedDate}. Selecciona tu fecha de salida.`, 'info');
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
              showToast(`Estancia seleccionada: ${calBookingCheckIn} al ${calBookingCheckOut} (${nights} noches). ¡Listo para reservar!`, 'success');
            }
          }

          updateCalendarBookingPanel();
          loadAndRenderCalendar(roomId, year, month);
        });
      });

    } catch (err) {
      calDaysGrid.innerHTML = `<div style="grid-column: span 7; color: #B42318; padding: 1.5rem;">Error al consultar calendario: ${err.message}</div>`;
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
