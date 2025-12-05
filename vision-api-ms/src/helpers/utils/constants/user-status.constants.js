
const USER_STATUS = Object.freeze({
    ACTIVE: { id: 1, name: "Activo" },
    INACTIVE: { id: 2, name: "Inactivo" },
    LOCKED: { id: 3, name: "Bloqueado" },
    DELETED: { id: 4, name: "Eliminado" },
    PENDING: { id: 5, name: "Pendiente de activación" }
});

module.exports = {
    USER_STATUS
}