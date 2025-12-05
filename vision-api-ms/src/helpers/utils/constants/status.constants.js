const STATUS = Object.freeze({
  // Notifications
  QUEUED: { id: 1, category: "notification", code: "queued", name: "En cola", description: "Notificación en cola, pendiente de envío", isActive: true },
  SENDING: { id: 2, category: "notification", code: "sending", name: "Enviando", description: "En proceso de envío", isActive: true },
  SENT: { id: 3, category: "notification", code: "sent", name: "Enviado", description: "Enviado al proveedor", isActive: true },
  FAILED: { id: 4, category: "notification", code: "failed", name: "Fallido", description: "Entrega fallida", isActive: true },

  // API Keys
  APIKEY_ACTIVE: { id: 5, category: "api_key", code: "active", name: "Activo", description: "Clave API habilitada", isActive: true },
  APIKEY_DISABLED: { id: 6, category: "api_key", code: "disabled", name: "Deshabilitado", description: "Clave temporalmente deshabilitada", isActive: true },
  APIKEY_REVOKED: { id: 7, category: "api_key", code: "revoked", name: "Revocado", description: "Clave revocada permanentemente", isActive: false },

  // System
  SYSTEM_HEALTHY: { id: 8, category: "system", code: "healthy", name: "Saludable", description: "Sistema operando normalmente", isActive: true },
  SYSTEM_DEGRADED: { id: 9, category: "system", code: "degraded", name: "Degradado", description: "Rendimiento degradado / parcial", isActive: true },
  SYSTEM_MAINTENANCE: { id: 10, category: "system", code: "maintenance", name: "Mantenimiento", description: "Mantenimiento programado", isActive: true },
  SYSTEM_OFFLINE: { id: 11, category: "system", code: "offline", name: "Offline", description: "Sistema fuera de servicio", isActive: false }
});

module.exports = {
  STATUS
};