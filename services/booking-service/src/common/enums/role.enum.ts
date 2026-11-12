/**
 * Enum de roles del sistema — copia fiel del enum canónico de auth-service.
 * Roles oficiales: GUEST (cliente), RECEPTIONIST (recepción), HOTEL_ADMIN (administrador).
 * No existen otros roles: cualquier variante anterior (HOTEL_MANAGER, alias ADMIN) quedó eliminada.
 */
export enum Role {
  GUEST = 'GUEST',
  RECEPTIONIST = 'RECEPTIONIST',
  HOTEL_ADMIN = 'HOTEL_ADMIN',
}
