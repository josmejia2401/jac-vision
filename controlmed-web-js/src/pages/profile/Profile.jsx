import { useEffect, useState, useRef } from 'react';

import Loader from '../../components/Loader';
import AppSnackbar from '../../components/AppSnackbar';
import UsersService from '../../services/users.service';
import { AuthStore } from '../../helpers/cache';

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : '—';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const didFetch = useRef(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await UsersService.getById(
          AuthStore.getState().tokenInfo.keyid
        );

        setUser(profile.data);
        setForm({
          firstName: profile.data.firstName,
          lastName: profile.data.lastName,
          email: profile.data.email,
          phoneNumber: profile.data.phoneNumber
        });
      } catch (error) {
        console.error(error);
        showSnackbar('Error al cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (didFetch.current) return;
    didFetch.current = true;
    loadProfile();
  }, []);

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await UsersService.updateById(
        AuthStore.getState().tokenInfo.keyid,
        form
      );
      setUser({ ...user, ...updated });
      setEditing(false);
      showSnackbar('Perfil actualizado', 'success');
    } catch {
      showSnackbar('No se pudo actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader message="Cargando perfil..." />}

      <div className="d-flex justify-content-center mt-5">
        <div className="card shadow-sm w-100" style={{ maxWidth: 700 }}>
          <div className="card-body p-4">

            {/* Header */}
            <h4 className="fw-bold mb-1">Perfil de Usuario</h4>

            <span className="badge bg-warning text-dark mt-2">
              {user?.status?.name ?? '—'}
            </span>

            <hr className="my-4" />

            {/* ===============================
                INFORMACIÓN PERSONAL
            ================================= */}
            <h6 className="fw-semibold mb-3">Información personal</h6>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.firstName}
                  disabled={!editing}
                  onChange={handleChange('firstName')}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellido</label>
                <input
                  className="form-control"
                  value={form.lastName}
                  disabled={!editing}
                  onChange={handleChange('lastName')}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input
                  className="form-control"
                  value={form.email}
                  disabled={!editing}
                  onChange={handleChange('email')}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  value={form.phoneNumber}
                  disabled={!editing}
                  onChange={handleChange('phoneNumber')}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Usuario</label>
                <input
                  className="form-control"
                  value={user?.username || ''}
                  disabled
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* ===============================
                SEGURIDAD
            ================================= */}
            <h6 className="fw-semibold mb-3">Seguridad</h6>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Último inicio de sesión</label>
                <input
                  className="form-control"
                  value={formatDate(user?.security?.lastLoginAt)}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Intentos fallidos</label>
                <input
                  className="form-control"
                  value={user?.security?.loginAttempts ?? 0}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Cuenta bloqueada hasta</label>
                <input
                  className="form-control"
                  value={formatDate(user?.security?.lockedUntil)}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Roles</label>
                <input
                  className="form-control"
                  value={
                    user?.security?.roles?.length
                      ? user.security.roles.join(', ')
                      : 'Sin roles'
                  }
                  disabled
                />
              </div>
            </div>

            {/* ===============================
                ACTIONS
            ================================= */}
            <div className="d-flex gap-2 mt-4">
              {!editing ? (
                <button
                  className="btn btn-warning w-100"
                  onClick={() => setEditing(true)}
                >
                  Editar perfil
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-warning w-100"
                    onClick={handleSave}
                  >
                    Guardar cambios
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar(prev => ({ ...prev, open: false }))
        }
      />
    </>
  );
}
