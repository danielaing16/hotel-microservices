// Controlador de la Interfaz Gráfica (Estilo Moderno Travel Glassmorphism con Barra Lateral)
document.addEventListener('DOMContentLoaded', () => {
  const api = window.apiClient;

  // Contenedores Principales
  const authCanvas = document.getElementById('authCanvas');
  const dashboardCanvas = document.getElementById('dashboardCanvas');
  const loginFormView = document.getElementById('loginFormView');
  const registerFormView = document.getElementById('registerFormView');
  const googleAuthModal = document.getElementById('googleAuthModal');
  const closeGoogleModalBtn = document.getElementById('closeGoogleModalBtn');
  const googleCustomForm = document.getElementById('googleCustomForm');
  const btnGuestVoucherSample = document.getElementById('btnGuestVoucherSample');

  // Alternadores de formulario
  const goToRegisterLink = document.getElementById('goToRegisterLink');
  const goToLoginLink = document.getElementById('goToLoginLink');
  const homeCircleBtn = document.getElementById('homeCircleBtn');

  // Formularios
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const submitLoginBtn = document.getElementById('submitLoginBtn');
  const submitRegBtn = document.getElementById('submitRegBtn');

  // Botones de Relleno Rápido & Demo
  const fillGuestBtn = document.getElementById('fillGuestBtn');
  const fillAdminBtn = document.getElementById('fillAdminBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const forgotPassLink = document.getElementById('forgotPassLink');
  const pingStatusBtn = document.getElementById('pingStatusBtn');

  // Dashboard & Sesión
  const dashUserName = document.getElementById('dashUserName');
  const dashUserEmail = document.getElementById('dashUserEmail');
  const dashRoleBadge = document.getElementById('dashRoleBadge');
  const dashUserId = document.getElementById('dashUserId');
  const dashJwtToken = document.getElementById('dashJwtToken');
  const logoutBtn = document.getElementById('logoutBtn');
  const testRbacBtn = document.getElementById('testRbacBtn');
  const rbacFeedback = document.getElementById('rbacFeedback');

  // Títulos y Pestañas del Dashboard
  const dashViewTitle = document.getElementById('dashViewTitle');
  const dashViewDesc = document.getElementById('dashViewDesc');
  const sidebarNavItems = document.querySelectorAll('.dash-nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.dash-tab-content');

  // Indicadores de Salud (Dashboard Header)
  const gatewayDot = document.getElementById('gatewayDot');
  const authDot = document.getElementById('authDot');
  const hotelsDot = document.getElementById('hotelsDot');
  const notificationsDot = document.getElementById('notificationsDot');

  // Indicadores de Salud (Auth Canvas Header)
  const authGatewayDot = document.getElementById('authGatewayDot');
  const authAuthDot = document.getElementById('authAuthDot');
  const authHotelsDot = document.getElementById('authHotelsDot');
  const authNotificationsDot = document.getElementById('authNotificationsDot');

  // Indicadores de Salud (Pestaña Cluster Gateway)
  const clusterGatewayDot = document.getElementById('clusterGatewayDot');
  const clusterAuthDot = document.getElementById('clusterAuthDot');
  const clusterHotelsDot = document.getElementById('clusterHotelsDot');
  const clusterNotifDot = document.getElementById('clusterNotifDot');

  // Consola & Logs
  const consoleLogs = document.getElementById('consoleLogs');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const pingGatewayBtn = document.getElementById('pingGatewayBtn');
  const toastShelf = document.getElementById('toastShelf');

  // Elementos de Hotels Service
  const openCreateHotelBtn = document.getElementById('openCreateHotelBtn');
  const seedHotelsBtn = document.getElementById('seedHotelsBtn');
  const refreshHotelsBtn = document.getElementById('refreshHotelsBtn');
  const filterHotelSearch = document.getElementById('filterHotelSearch');
  const filterHotelCity = document.getElementById('filterHotelCity');
  const filterHotelStars = document.getElementById('filterHotelStars');
  const filterPetFriendly = document.getElementById('filterPetFriendly');
  const hotelsGrid = document.getElementById('hotelsGrid');

  // Elementos de Notifications Service & Vouchers
  const btnVoucherSample = document.getElementById('btnVoucherSample');
  const btnTriggerWelcome = document.getElementById('btnTriggerWelcome');
  const btnTriggerBookingConfirm = document.getElementById('btnTriggerBookingConfirm');
  const btnTriggerPaymentFailed = document.getElementById('btnTriggerPaymentFailed');
  const btnTriggerCheckinReminder = document.getElementById('btnTriggerCheckinReminder');
  const btnTriggerRefund = document.getElementById('btnTriggerRefund');
  const refreshNotifHistoryBtn = document.getElementById('refreshNotifHistoryBtn');
  const notificationsHistoryList = document.getElementById('notificationsHistoryList');
  const notifCountBadge = document.getElementById('notifCountBadge');

  // Modales de Hotel
  const hotelDetailModal = document.getElementById('hotelDetailModal');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const hotelFormModal = document.getElementById('hotelFormModal');
  const closeFormModalBtn = document.getElementById('closeFormModalBtn');
  const hotelUpsertForm = document.getElementById('hotelUpsertForm');
  const hotelFormTitle = document.getElementById('hotelFormTitle');
  const submitHotelFormBtn = document.getElementById('submitHotelFormBtn');

  // Metadatos de Secciones del Dashboard (Leyes de Miller y Hick)
  const TAB_METADATA = {
    hotels: {
      title: 'Catálogo Central de Hoteles',
      desc: 'Gestión comercial y operativa de sedes provista por hotels-service:3002 vía API Gateway.',
    },
    notifications: {
      title: 'Worker Asíncrono de Notificaciones & Vouchers PDF',
      desc: 'Consumidor RabbitMQ desacoplado del checkout para emisión de comprobantes PDF con código QR y correos transaccionales Nodemailer.',
    },
    auth: {
      title: 'Identidad, Sesión & Seguridad RBAC',
      desc: 'Gestión de tokens JWT Bearer, claims criptográficos y autorización RBAC provista por auth-service:3001.',
    },
    gateway: {
      title: 'Consola de Tráfico & Monitoreo del Cluster',
      desc: 'Monitoreo de peticiones HTTP en tiempo real, latencias y enrutamiento perimetral en api-gateway:3000.',
    },
  };

  // Cambio de Pestañas con la Barra Lateral
  function switchDashboardTab(tabId) {
    sidebarNavItems.forEach(item => {
      const isMatch = item.getAttribute('data-tab') === tabId;
      item.classList.toggle('active', isMatch);
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

  // Sistema de Notificaciones Toast
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '🛑';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastShelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Consola de Tráfico HTTP en Tiempo Real
  api.onLog((log) => {
    if (!consoleLogs) return;

    const entry = document.createElement('div');
    const statusType = log.status >= 200 && log.status < 300 ? 'success' : (log.status >= 400 ? 'error' : 'info');
    entry.className = `console-entry ${statusType}`;
    
    entry.innerHTML = `
      <span>[${log.timestamp}]</span>
      <strong>${log.method}</strong>
      <span>${log.endpoint}</span>
      <span style="margin-left: auto;">${log.status || 'ERR'} (${log.durationMs}ms)</span>
    `;
    
    consoleLogs.prepend(entry);
    if (consoleLogs.children.length > 35) {
      consoleLogs.removeChild(consoleLogs.lastChild);
    }
  });

  clearConsoleBtn?.addEventListener('click', () => {
    if (consoleLogs) {
      consoleLogs.innerHTML = `
        <div class="console-entry info">
          [SYS] Consola limpiada por el usuario (${new Date().toLocaleTimeString()})
        </div>
      `;
      showToast('Consola de tráfico reiniciada', 'info');
    }
  });

  pingGatewayBtn?.addEventListener('click', () => {
    checkSystemHealth(true);
  });

  // Alternar Vistas Login / Registro
  goToRegisterLink?.addEventListener('click', () => {
    loginFormView.style.display = 'none';
    registerFormView.style.display = 'block';
  });

  goToLoginLink?.addEventListener('click', () => {
    registerFormView.style.display = 'none';
    loginFormView.style.display = 'block';
  });

  homeCircleBtn?.addEventListener('click', () => {
    refreshSessionView();
  });

  // Modal y Flujo de Inicio de Sesión con Google
  googleLoginBtn?.addEventListener('click', () => {
    if (googleAuthModal) googleAuthModal.style.display = 'flex';
  });

  closeGoogleModalBtn?.addEventListener('click', () => {
    if (googleAuthModal) googleAuthModal.style.display = 'none';
  });

  // Cerrar modal de Google al hacer clic fuera del diálogo
  googleAuthModal?.addEventListener('click', (e) => {
    if (e.target === googleAuthModal) {
      googleAuthModal.style.display = 'none';
    }
  });

  async function loginWithGoogle(email, firstName, lastName) {
    try {
      showToast('Autenticando con Google...', 'info');
      const res = await api.googleLogin({ email, firstName, lastName });
      
      // Si el usuario es nuevo, emitir evento de bienvenida y esperar a que quede registrado
      if (res && res.user) {
        try {
          await api.sendWelcomeNotification({
            userId: res.user.id,
            email: res.user.email,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            loginUrl: window.location.origin,
          });
        } catch (notifErr) {
          console.warn('Aviso bienvenida Google:', notifErr);
        }
      }

      if (googleAuthModal) googleAuthModal.style.display = 'none';
      showToast(`¡Autenticación con Google exitosa! Bienvenido, ${res.user.firstName}`, 'success');
      refreshSessionView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }


  googleCustomForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('googleCustomEmail').value.trim();
    const firstName = document.getElementById('googleCustomFirst').value.trim();
    const lastName = document.getElementById('googleCustomLast').value.trim();
    loginWithGoogle(email, firstName, lastName);
  });

  forgotPassLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Recuperación por correo planificada en Notifications Service', 'info');
  });

  pingStatusBtn?.addEventListener('click', () => {
    checkSystemHealth(true);
  });

  // Sincronización de Vista de Sesión
  function refreshSessionView() {
    const token = api.getToken();
    const user = api.getCurrentUser();

    if (token && user) {
      authCanvas.style.display = 'none';
      dashboardCanvas.classList.add('active');

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Huésped';
      dashUserName.textContent = fullName;
      dashUserEmail.textContent = user.email || 'correo@hotel.com';
      dashUserId.textContent = user.id || 'N/A';
      dashJwtToken.textContent = token;

      const role = user.role || 'GUEST';
      dashRoleBadge.textContent = role;
      dashRoleBadge.className = `dash-badge ${role.toLowerCase()}`;

      const isAdmin = role === 'HOTEL_ADMIN';
      const isStaff = role === 'HOTEL_ADMIN' || role === 'RECEPTIONIST';

      // 1. Hoteles: Solo HOTEL_ADMIN puede registrar o cargar demos
      if (openCreateHotelBtn) {
        openCreateHotelBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      }
      if (seedHotelsBtn) {
        seedHotelsBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      }

      // 2. Notificaciones: Solo HOTEL_ADMIN y RECEPTIONIST gestionan/disparan eventos
      const staffNotifTriggers = document.getElementById('staffNotifTriggers');
      const guestNotifBanner = document.getElementById('guestNotifBanner');
      const notifAuditTitle = document.getElementById('notifAuditTitle');
      const notifNavLabel = document.querySelector('.dash-nav-item[data-tab="notifications"] .dash-nav-label');

      const staffSection = document.getElementById('staffSection');
      if (staffSection) {
        staffSection.style.display = isStaff ? 'block' : 'none';
      }
      if (guestNotifBanner) {
        guestNotifBanner.style.display = isStaff ? 'none' : 'flex';
      }
      if (notifAuditTitle) {
        notifAuditTitle.textContent = isStaff 
          ? '📜 Registro de Auditoría de Envíos en Tiempo Real (Últimos 50 Eventos)'
          : '📜 Notificaciones y Comprobantes Recibidos en Tu Cuenta';
      }
      if (notifNavLabel) {
        notifNavLabel.textContent = isStaff ? 'Notif. & Vouchers' : 'Mis Notificaciones';
      }

      loadHotels();
      loadNotificationHistory();
      if (isStaff) loadUsersList();
    } else {
      authCanvas.style.display = 'flex';
      dashboardCanvas.classList.remove('active');
      loginFormView.style.display = 'block';
      registerFormView.style.display = 'none';
    }
  }

  // Envío de Formulario de Inicio de Sesión
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    submitLoginBtn.disabled = true;
    submitLoginBtn.innerHTML = '<span>Verificando...</span>';

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

  // Envío de Formulario de Registro
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;

    submitRegBtn.disabled = true;
    submitRegBtn.innerHTML = '<span>Registrando cuenta...</span>';

    try {
      // 1. Registrar usuario SIN auto-login para obligar a iniciar sesión
      const res = await api.register({ firstName, lastName, email, phone, role, password }, false);

      // 2. Despachar correo de bienvenida transaccional (user.registered) a notification-service
      try {
        await api.sendWelcomeNotification({
          userId: res.user?.id || 'new-user',
          email: email,
          firstName: firstName,
          lastName: lastName,
          loginUrl: window.location.origin,
        });
      } catch (notifErr) {
        console.warn('Aviso: error despachando notificación de bienvenida:', notifErr);
      }

      // 3. Notificar al usuario y redirigir inmediatamente al formulario de login
      showToast(`¡Registro exitoso! Se ha enviado un correo de bienvenida a ${email}. Por favor inicia sesión.`, 'success');

      // Limpiar formulario y alternar a vista de Login
      registerForm.reset();
      registerFormView.style.display = 'none';
      loginFormView.style.display = 'block';

      // Precargar correo registrado en campo de login y enfocar campo de contraseña
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

  // Cerrar Sesión
  logoutBtn?.addEventListener('click', () => {
    api.clearSession();
    showToast('Sesión cerrada correctamente', 'info');
    refreshSessionView();
  });

  // Demostración RBAC (Roles)
  testRbacBtn?.addEventListener('click', async () => {
    testRbacBtn.disabled = true;
    rbacFeedback.style.display = 'block';
    rbacFeedback.innerHTML = 'Consultando endpoint protegido /api/auth/admin-only...';

    try {
      const res = await api.testAdminOnly();
      rbacFeedback.innerHTML = `
        <span style="color: #34d399; font-weight: bold;">[Acceso Autorizado]</span><br>
        <strong>Mensaje:</strong> ${res.message}<br>
        <strong>Rol Requerido:</strong> ${res.requiredRole}<br>
        <strong>Usuario ID:</strong> ${res.requestedBy.id}
      `;
      showToast('Autorización RBAC confirmada', 'success');
    } catch (err) {
      rbacFeedback.innerHTML = `
        <span style="color: #f87171; font-weight: bold;">[Acceso Denegado 403 Forbidden]</span><br>
        <strong>Error:</strong> ${err.message}<br>
        <em>Tu usuario actual no posee el rol HOTEL_ADMIN requerido.</em>
      `;
      showToast('Acceso denegado por RBAC', 'error');
    } finally {
      testRbacBtn.disabled = false;
    }
  });

  // =========================================================================
  // LISTADO DE USUARIOS (Solo Admin / Recepcionista)
  // =========================================================================

  async function loadUsersList() {
    const usersPanel = document.getElementById('usersListPanel');
    if (!usersPanel) return;
    const innerPanel = usersPanel.querySelector('div[style*="overflow-y"]') || usersPanel;
    try {
      const users = await api.getAllUsers();
      renderUsersList(users);
    } catch (err) {
      innerPanel.innerHTML = '<p style="color:var(--text-dim); padding:1rem;">No se pudo cargar la lista de usuarios.</p>';
      console.warn('Error cargando usuarios:', err);
    }
  }

  function renderUsersList(users = []) {
    const usersPanel = document.getElementById('usersListPanel');
    if (!usersPanel) return;
    const innerPanel = usersPanel.querySelector('div[style*="overflow-y"]') || usersPanel;

    if (!users || users.length === 0) {
      innerPanel.innerHTML = '<p style="color:var(--text-dim); padding:1rem;">No hay usuarios registrados aún.</p>';
      return;
    }

    const roleColor = { HOTEL_ADMIN: '#f59e0b', RECEPTIONIST: '#6366f1', GUEST: '#22c55e' };

    innerPanel.innerHTML = users.map(u => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sin nombre';
      const color = roleColor[u.role] || '#94a3b8';
      const initials = (u.firstName?.[0] || '') + (u.lastName?.[0] || '');
      return `
        <div class="user-list-item" style="display:flex; align-items:center; gap:0.75rem; padding:0.65rem 1rem; border-bottom:1px solid rgba(255,255,255,0.07); transition: background 0.2s;" 
             onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">
          <div style="width:36px; height:36px; border-radius:50%; background:${color}22; border:2px solid ${color}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem; color:${color}; flex-shrink:0;">${initials || '?'}</div>
          <div style="flex:1; min-width:0;">
            <div style="color:#f8fafc; font-weight:600; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${fullName}</div>
            <div style="color:var(--text-dim); font-size:0.72rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${u.email}</div>
          </div>
          <span style="font-size:0.65rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:999px; background:${color}22; color:${color}; border:1px solid ${color}44; flex-shrink:0;">${u.role}</span>
          <button onclick="sendNotifToUser('${u.email}', '${fullName.replace(/'/g, '')}')"
            style="font-size:0.7rem; padding:0.3rem 0.65rem; border-radius:6px; background:rgba(99,102,241,0.15); color:#a5b4fc; border:1px solid rgba(99,102,241,0.3); cursor:pointer; flex-shrink:0; transition: background 0.2s;"
            onmouseover="this.style.background='rgba(99,102,241,0.3)'" onmouseout="this.style.background='rgba(99,102,241,0.15)'">
            📨 Notificar
          </button>
          <button onclick="deleteUserById('${u.id}', '${u.email.replace(/'/g, '')}')"
            style="font-size:0.7rem; padding:0.3rem 0.65rem; border-radius:6px; background:rgba(248,113,113,0.1); color:#f87171; border:1px solid rgba(248,113,113,0.3); cursor:pointer; flex-shrink:0; transition: background 0.2s;"
            onmouseover="this.style.background='rgba(248,113,113,0.25)'" onmouseout="this.style.background='rgba(248,113,113,0.1)'"
            title="Eliminar usuario">
            🗑️
          </button>
        </div>
      `;
    }).join('');
  }

  window.sendNotifToUser = async function(email, name) {
    try {
      showToast(`Enviando notificación a ${name}...`, 'info');
      await api.sendWelcomeNotification({
        userId: 'admin_dispatch',
        email: email,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        loginUrl: window.location.origin,
      });
      showToast(`Notificación enviada a ${name} ✓`, 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Eliminar usuario individual por ID (solo HOTEL_ADMIN)
  window.deleteUserById = async function(id, email) {
    if (!confirm(`¿Eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) return;
    try {
      showToast(`Eliminando usuario ${email}...`, 'info');
      const res = await api.deleteUser(id);
      showToast(res.message || `Usuario ${email} eliminado`, 'success');
      loadUsersList();
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
    }
  };

  // Botón: Eliminar todos los usuarios GUEST (liberar correos de prueba)
  document.getElementById('btnDeleteGuests')?.addEventListener('click', async () => {
    if (!confirm('¿Confirmas que deseas eliminar TODOS los usuarios con rol GUEST?\n\nEsta acción liberará sus correos y no se puede deshacer.')) return;
    try {
      showToast('Eliminando usuarios GUEST...', 'info');
      const res = await api.deleteGuests();
      const msg = res.message || `${res.deletedCount ?? 0} usuario(s) GUEST eliminados`;
      showToast(msg, 'success');
      loadUsersList();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  // =========================================================================
  // CONTROLADOR DEL MICROSERVICIO DE NOTIFICACIONES Y VOUCHERS
  // =========================================================================

  async function loadNotificationHistory() {
    try {
      const history = await api.getNotificationHistory();
      const currentUser = api.getCurrentUser();
      const role = currentUser ? (currentUser.role || 'GUEST') : 'GUEST';
      const isStaff = role === 'HOTEL_ADMIN' || role === 'RECEPTIONIST';

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

      // GUEST solo ve sus propias notificaciones; el staff ve todo
      let filteredHistory = history;
      if (!isStaff && currentUser && currentUser.email) {
        filteredHistory = (history || []).filter(item => {
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
      const isStaff = user && (user.role === 'HOTEL_ADMIN' || user.role === 'RECEPTIONIST');
      notificationsHistoryList.innerHTML = `
        <div class="notif-history-empty">
          ${isStaff 
            ? 'No se han procesado notificaciones en esta sesión. Utiliza los botones de arriba para disparar eventos o consultar el broker.' 
            : 'No tienes notificaciones registradas en tu buzón personal por el momento.'}
        </div>
      `;
      return;
    }

    notificationsHistoryList.innerHTML = history.map(item => {
      const timeStr = new Date(item.timestamp).toLocaleTimeString();
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
            <span class="notif-badge-tag ${item.type}">${item.type}</span>
            <strong style="color: #f8fafc;">${item.recipient}</strong>
            <span style="color: var(--text-dim); font-size: 0.75rem;">${item.subject}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-left: auto;">
            <span style="color: var(--text-dim); font-size: 0.7rem;">${timeStr} (${item.durationMs}ms)</span>
            ${attachmentBadge}
            ${previewLink}
          </div>
        </div>
      `;
    }).join('');
  }

  // 1. Descargar Voucher PDF de Muestra (Abre en nueva pestaña / descarga directa)
  btnVoucherSample?.addEventListener('click', () => {
    const url = api.getVoucherSampleUrl();
    window.open(url, '_blank');
    showToast('Generando y transmitiendo Voucher PDF con QR para lectura en recepción...', 'success');
  });

  // 2. Disparar Correo de Bienvenida (user.registered)
  btnTriggerWelcome?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || {
      firstName: 'Mauricio',
      lastName: 'Gómez',
      email: 'mauricio@hotel-dev.com',
    };

    try {
      showToast('Despachando evento user.registered...', 'info');
      await api.sendWelcomeNotification({
        userId: user.id || 'usr_dev_100',
        email: user.email || 'mauricio@hotel-dev.com',
        firstName: user.firstName || 'Mauricio',
        lastName: user.lastName || 'Gómez',
        loginUrl: window.location.origin,
      });
      showToast('Correo de bienvenida despachado exitosamente', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  // 3. Disparar Confirmación de Reserva con Voucher PDF (booking.confirmed)
  btnTriggerBookingConfirm?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || {
      firstName: 'Mauricio',
      lastName: 'Gómez',
      email: 'mauricio@hotel-dev.com',
    };

    const ref = `TR-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      showToast('Generando Voucher PDF y despachando confirmación...', 'info');
      await api.sendBookingConfirmationNotification({
        bookingId: `bkg_${Date.now()}_sim`,
        bookingReference: ref,
        userEmail: user.email || 'mauricio@hotel-dev.com',
        userName: `${user.firstName || 'Mauricio'} ${user.lastName || 'Gómez'}`,
        hotelName: 'The Grand Riviera Luxury Palace',
        hotelAddress: 'Av. Costanera Km 14',
        hotelCity: 'Cancún, México',
        roomTypeName: 'Master Oceanfront Suite con Balcón',
        checkInDate: '2026-11-20',
        checkOutDate: '2026-11-25',
        nights: 5,
        guestsCount: 2,
        totalAmount: 950.0,
        currency: 'USD',
        paymentId: `pi_stripe_${Date.now().toString(36)}`,
        paymentMethod: 'Tarjeta Visa terminada en 4242',
      });
      showToast(`¡Voucher PDF emitido y correo despachado para ${ref}!`, 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  // 4. Disparar Notificación de Pago Fallido (payment.failed)
  btnTriggerPaymentFailed?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || {
      firstName: 'Mauricio',
      lastName: 'Gómez',
      email: 'mauricio@hotel-dev.com',
    };

    try {
      showToast('Despachando evento payment.failed...', 'info');
      await api.sendPaymentFailedNotification({
        bookingId: `bkg_pend_${Math.random().toString(36).substring(2, 7)}`,
        userEmail: user.email || 'mauricio@hotel-dev.com',
        userName: `${user.firstName || 'Mauricio'} ${user.lastName || 'Gómez'}`,
        hotelName: 'Cartagena Paradise Beach Resort',
        roomTypeName: 'Junior Suite Vista al Mar',
        totalAmount: 480.0,
        currency: 'USD',
        failureReason: 'Fondos insuficientes (card_declined) reportados por la pasarela',
        retryPaymentUrl: `${window.location.origin}/checkout?retry=true`,
        expiresAt: 'Restan 8 minutos de reserva en Redis',
      });
      showToast('Alerta de pago fallido despachada con éxito', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  // 5. Disparar Recordatorio de Check-in 24h (booking.checkin.reminder)
  btnTriggerCheckinReminder?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || {
      firstName: 'Mauricio',
      lastName: 'Gómez',
      email: 'mauricio@hotel-dev.com',
    };

    try {
      showToast('Despachando recordatorio de check-in 24h...', 'info');
      await api.sendCheckinReminderNotification({
        bookingId: `bkg_chk_${Date.now().toString(36)}`,
        bookingReference: 'TR-2026-REMINDER',
        userEmail: user.email || 'mauricio@hotel-dev.com',
        userName: `${user.firstName || 'Mauricio'} ${user.lastName || 'Gómez'}`,
        hotelName: 'The Palm Luxury Suites & Spa',
        hotelAddress: 'Calle 50 # 12-40, Bocagrande',
        hotelCity: 'Cartagena de Indias',
        roomTypeName: 'Penthouse Imperial con Jacuzzi',
        checkInDate: 'Mañana',
        checkInTime: '15:00',
        specialInstructions: 'Recepción VIP con copa de champagne de bienvenida.',
      });
      showToast('Recordatorio de check-in enviado exitosamente', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  // 6. Disparar Comprobante de Reembolso (payment.refunded)
  btnTriggerRefund?.addEventListener('click', async () => {
    const user = api.getCurrentUser() || {
      firstName: 'Mauricio',
      lastName: 'Gómez',
      email: 'mauricio@hotel-dev.com',
    };

    try {
      showToast('Despachando comprobante de reembolso...', 'info');
      await api.sendRefundReceiptNotification({
        bookingId: `bkg_canc_${Date.now().toString(36)}`,
        bookingReference: 'TR-2026-REFUND',
        refundId: `ref_stripe_${Math.random().toString(36).substring(2, 9)}`,
        userEmail: user.email || 'mauricio@hotel-dev.com',
        userName: `${user.firstName || 'Mauricio'} ${user.lastName || 'Gómez'}`,
        hotelName: 'The Grand Riviera Luxury Palace',
        roomTypeName: 'Master Oceanfront Suite',
        refundAmount: 950.0,
        originalAmount: 950.0,
        currency: 'USD',
        reason: 'Cancelación voluntaria del huésped con anticipación mayor a 48h.',
      });
      showToast('Comprobante de reembolso despachado exitosamente', 'success');
      loadNotificationHistory();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  });

  refreshNotifHistoryBtn?.addEventListener('click', () => {
    loadNotificationHistory();
    showToast('Historial de notificaciones actualizado', 'info');
  });

  // =========================================================================
  // CONTROLADOR DEL CATÁLOGO DE HOTELES (Hotels Service)
  // =========================================================================

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
          <span style="font-size: 0.75rem;">Intenta limpiar los filtros o presiona "Cargar Demo"</span>
        </div>
      `;
      return;
    }

    const currentUser = api.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'HOTEL_ADMIN';

    // Helper para extraer la imagen óptima del hotel según el esquema de datos
    function extractHotelImg(h) {
      if (Array.isArray(h.images) && h.images.length > 0 && h.images[0]) {
        return h.images[0];
      }
      if (typeof h.images === 'string' && h.images.trim()) {
        return h.images.split(',')[0].trim();
      }
      if (h.mainImageUrl) {
        return h.mainImageUrl;
      }
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    }

    hotelsGrid.innerHTML = hotels.map(h => {
      const starsStr = '⭐'.repeat(h.stars || 5);
      const isPet = h.petFriendly ?? h.isPetFriendly;
      const petStr = isPet ? '🐾 Pet-friendly' : '🚫 No mascotas';
      const amenitiesStr = Array.isArray(h.amenities) ? h.amenities.slice(0, 3).map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('') : '';
      const hotelImg = extractHotelImg(h);

      const adminButtons = isAdmin ? `
        <div class="hotel-admin-actions">
          <button class="btn-card-edit" data-id="${h.id}" title="Editar Hotel">✏️</button>
          <button class="btn-card-delete" data-id="${h.id}" data-name="${h.name}" title="Desactivar Hotel">🗑️</button>
        </div>
      ` : '';

      return `
        <div class="hotel-card" data-id="${h.id}">
          <div class="hotel-card-media">
            <img src="${hotelImg}" alt="${h.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';">
            <div class="badge-stars">${starsStr}</div>
            <div class="badge-city">${h.city || 'Destino Exclusivo'}</div>
            ${adminButtons}
          </div>
          <div class="hotel-card-body">
            <h3 class="hotel-card-title">${h.name}</h3>
            <div class="hotel-card-location">📍 ${h.address}, ${h.city}</div>
            <p class="hotel-card-desc">${h.description ? h.description.substring(0, 110) + '...' : ''}</p>
            <div class="hotel-amenities-tags">
              ${amenitiesStr}
            </div>
          </div>
          <div class="hotel-card-footer">
            <div class="hotel-policy-pill">${petStr}</div>
            <button class="btn-hotel-detail" data-id="${h.id}">Ver Detalles</button>
          </div>
        </div>
      `;
    }).join('');

    // Eventos de botones dentro de las tarjetas
    document.querySelectorAll('.btn-hotel-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openHotelDetail(btn.getAttribute('data-id'));
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
        if (confirm(`¿Confirmas que deseas desactivar la sede hotelera "${name}"?`)) {
          try {
            await api.deleteHotel(id);
            showToast(`Hotel "${name}" desactivado`, 'info');
            loadHotels();
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      });
    });
  }

  // Abrir Modal de Detalle
  async function openHotelDetail(id) {
    try {
      const hotel = await api.getHotelById(id);
      const hotelImg = (Array.isArray(hotel.images) && hotel.images[0])
        ? hotel.images[0]
        : (typeof hotel.images === 'string' && hotel.images.trim() ? hotel.images.split(',')[0].trim() : '')
        || hotel.mainImageUrl
        || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

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
      document.getElementById('detailCancellation').textContent = hotel.cancellationPolicy || 'Políticas de cancelación según tarifa.';

      const amenitiesBox = document.getElementById('detailAmenities');
      amenitiesBox.innerHTML = Array.isArray(hotel.amenities)
        ? hotel.amenities.map(a => `<span class="hotel-amenity-tag">${a}</span>`).join('')
        : '<span style="color: var(--text-dim);">Sin amenidades registradas</span>';

      hotelDetailModal.style.display = 'flex';
    } catch (err) {
      showToast(`Error cargando detalle: ${err.message}`, 'error');
    }
  }

  // Modal de Crear / Editar Hotel
  openCreateHotelBtn?.addEventListener('click', () => {
    hotelUpsertForm.reset();
    document.getElementById('formHotelId').value = '';
    hotelFormTitle.textContent = '🏢 Registrar Nueva Sede Hotelera';
    hotelFormModal.style.display = 'flex';
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
      showToast(`Error preparando edición: ${err.message}`, 'error');
    }
  }

  // Guardar Hotel (Crear o Actualizar)
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
        showToast('Hotel actualizado exitosamente', 'success');
      } else {
        await api.createHotel(payload);
        showToast('Nuevo hotel registrado exitosamente', 'success');
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

  // Cargar Catálogo Demo
  seedHotelsBtn?.addEventListener('click', async () => {
    seedHotelsBtn.disabled = true;
    showToast('Cargando hoteles de prueba iniciales...', 'info');

    try {
      const res = await api.seedHotels();
      showToast(res.message || 'Catálogo de prueba cargado con éxito', 'success');
      loadHotels();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      seedHotelsBtn.disabled = false;
    }
  });

  // Refrescar Catálogo
  refreshHotelsBtn?.addEventListener('click', () => {
    loadHotels();
    showToast('Catálogo de hoteles actualizado', 'info');
  });

  // Cerrar Modales
  closeDetailModalBtn?.addEventListener('click', () => {
    hotelDetailModal.style.display = 'none';
  });

  closeFormModalBtn?.addEventListener('click', () => {
    hotelFormModal.style.display = 'none';
  });

  hotelDetailModal?.addEventListener('click', (e) => {
    if (e.target === hotelDetailModal) hotelDetailModal.style.display = 'none';
  });

  hotelFormModal?.addEventListener('click', (e) => {
    if (e.target === hotelFormModal) hotelFormModal.style.display = 'none';
  });

  // Filtros interactivos con debounce
  let filterTimer = null;
  function triggerFilterDebounce() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(loadHotels, 350);
  }

  filterHotelSearch?.addEventListener('input', triggerFilterDebounce);
  filterHotelCity?.addEventListener('change', loadHotels);
  filterHotelStars?.addEventListener('change', loadHotels);
  filterPetFriendly?.addEventListener('change', loadHotels);

  // Helper para asignar clase online/offline a una lista de puntos de estado
  function setDotsState(dots, isOnline) {
    dots.forEach(dot => {
      if (dot) dot.className = `dot ${isOnline ? 'online' : 'offline'}`;
    });
  }

  // Monitoreo de Salud de Microservicios
  async function checkSystemHealth(manual = false) {
    // 1. Gateway
    try {
      await api.checkGatewayHealth();
      setDotsState([gatewayDot, authGatewayDot, clusterGatewayDot], true);
    } catch {
      setDotsState([gatewayDot, authGatewayDot, clusterGatewayDot], false);
    }

    // 2. Microservicios Downstream
    try {
      const services = await api.checkServicesHealth();
      
      const auth = services?.services?.find(s => s.service === 'auth-service');
      setDotsState([authDot, authAuthDot, clusterAuthDot], auth?.status === 'ONLINE');

      const hotels = services?.services?.find(s => s.service === 'hotels-service');
      setDotsState([hotelsDot, authHotelsDot, clusterHotelsDot], hotels?.status === 'ONLINE');

      const notif = services?.services?.find(s => s.service === 'notification-service');
      setDotsState([notificationsDot, authNotificationsDot, clusterNotifDot], notif?.status === 'ONLINE');
    } catch {
      setDotsState([authDot, authAuthDot, clusterAuthDot], false);
      setDotsState([hotelsDot, authHotelsDot, clusterHotelsDot], false);
      setDotsState([notificationsDot, authNotificationsDot, clusterNotifDot], false);
    }

    if (manual) {
      showToast('Estado de microservicios actualizado', 'info');
    }
  }

  // Inicialización
  refreshSessionView();
  checkSystemHealth();
  setInterval(checkSystemHealth, 9000);
});
