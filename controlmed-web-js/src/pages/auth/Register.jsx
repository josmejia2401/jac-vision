import { useState } from 'react';
import { Link } from 'react-router-dom';

import routes from '../../routes/routes';
import Loader from '../../components/Loader';
import AppSnackbar from '../../components/AppSnackbar';
import UsersService from '../../services/users.service';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (message, severity = 'info') =>
    setSnackbar({ open: true, message, severity });

  /* ================= VALIDATIONS ================= */

  const validators = {
    firstName: v => (!v ? 'El nombre es obligatorio' : ''),
    lastName: v => (!v ? 'El apellido es obligatorio' : ''),
    email: v =>
      !v
        ? 'El correo es obligatorio'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? 'Correo inválido'
          : '',
    phoneNumber: v => (!v ? 'El teléfono es obligatorio' : ''),
    username: v =>
      !v
        ? 'El usuario es obligatorio'
        : v.length < 3
          ? 'Debe tener al menos 3 caracteres'
          : '',
    password: v =>
      !v
        ? 'La contraseña es obligatoria'
        : v.length < 6
          ? 'Debe tener al menos 6 caracteres'
          : ''
  };

  const validateField = (name, value) => validators[name](value);

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar('Revisa los campos del formulario', 'warning');
      return;
    }

    setLoading(true);

    try {
      await UsersService.create({ ...form, security: { loginAttempts: 0, lockedUntil: null, lastLoginAt: null, roles: ["USER"] } });
      showSnackbar('Registro exitoso, ahora puedes iniciar sesión', 'success');
    } catch (error) {
      showSnackbar(
        error?.message || 'Error al crear la cuenta',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader message="Creando cuenta..." />}

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
        <div className="card login-card border-0 shadow-sm w-100" style={{ maxWidth: 420 }}>
          <div className="card-body p-4 p-md-5">

            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1 text-primary letter-spacing">
                Control<span className="text-dark">Med</span>
              </h2>
              <p className="text-muted mb-0 small">
                Crea tu cuenta para comenzar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  name="firstName"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  value={form.firstName}
                  disabled={loading}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.firstName}</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input
                  name="lastName"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  value={form.lastName}
                  disabled={loading}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.lastName}</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={form.email}
                  disabled={loading}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.email}</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  name="phoneNumber"
                  className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  value={form.phoneNumber}
                  disabled={loading}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.phoneNumber}</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  name="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={form.username}
                  disabled={loading}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.username}</div>
              </div>

              <div className="mb-4">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={form.password}
                  disabled={loading}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.password}</div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to={routes.LOGIN}
                  className="fw-semibold text-decoration-none text-primary"
                >
                  Inicia sesión
                </Link>
              </small>
            </div>

          </div>
        </div>
      </div>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}
