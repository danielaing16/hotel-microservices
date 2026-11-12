/**
 * Enum de roles del sistema — copia fiel del enum canónico de auth-service.
 * Roles oficiales: GUEST (huésped) y HOTEL_ADMIN (administrador). RECEPTIONIST fue eliminado.
 * No existen otros roles: cualquier variante anterior (HOTEL_MANAGER, alias ADMIN) quedó eliminada.
 */
export enum Role {
  GUEST = 'GUEST',
  HOTEL_ADMIN = 'HOTEL_ADMIN',
}
