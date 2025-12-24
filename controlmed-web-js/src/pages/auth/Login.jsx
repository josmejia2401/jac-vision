import { useState } from 'react';
import { Link } from 'react-router-dom';

import routes from '../../routes/routes';
import Loader from '../../components/Loader';
import AppSnackbar from '../../components/AppSnackbar';
import AuthService from '../../services/auth.service';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (message, severity = 'info') =>
    setSnackbar({ open: true, message, severity });

  const validateUsername = (value) => {
    if (!value) return 'El usuario es obligatorio';
    if (value.length < 3) return 'Debe tener al menos 3 caracteres';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 6) return 'Debe tener al menos 6 caracteres';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    setErrors({ username: usernameError, password: passwordError });

    if (usernameError || passwordError) {
      showSnackbar('Revisa los campos del formulario', 'warning');
      return;
    }

    setLoading(true);

    try {
      await AuthService.login({ username, password });
      showSnackbar('Inicio de sesión exitoso', 'success');
    } catch (error) {
      showSnackbar(
        error?.message || 'Usuario o contraseña incorrectos',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader message="Iniciando sesión..." />}

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
        <div className="card login-card border-0 shadow-sm w-100" style={{ maxWidth: 420 }}>
          <div className="card-body p-4 p-md-5">

            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1 text-primary letter-spacing">
                Control<span className="text-dark">Med</span>
              </h2>
              <p className="text-muted mb-0 small">
                Accede a tu panel de gestión
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={username}
                  disabled={loading}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      username: validateUsername(e.target.value)
                    }));
                  }}
                />
                {errors.username && (
                  <div className="invalid-feedback">
                    {errors.username}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      password: validatePassword(e.target.value)
                    }));
                  }}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                ¿No tienes cuenta?{' '}
                <Link
                  to={routes.REGISTER}
                  className="fw-semibold text-decoration-none text-primary"
                >
                  Crear cuenta
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
