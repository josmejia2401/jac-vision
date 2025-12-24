import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import routes from '../../routes/routes';
import AuthService from '../../services/auth.service';

const navItems = [
  { label: 'Inicio', path: routes.DASHBOARD },
  { label: 'Dependientes', path: routes.DEPENDENTS },
  { label: 'Registros', path: routes.RECORDS }
];

export default function MainLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout().finally(() => navigate(routes.LOGIN));
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container-fluid px-4">

          {/* Brand */}
          <span
            className="navbar-brand fw-bold letter-spacing cursor-pointer"
            role="button"
            onClick={() => navigate(routes.DASHBOARD)}
          >
            <span className="text-primary">Control</span>
            <span className="text-dark">Med</span>
          </span>

          {/* Toggle (mobile) */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            {/* Navigation */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2 ms-lg-4">
              {navItems.map(item => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `
                      nav-link px-3 py-2 rounded-3
                      ${isActive
                        ? 'fw-semibold text-primary bg-primary bg-opacity-10'
                        : 'text-secondary'}
                      `
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Profile */}
            <div className="dropdown ms-lg-3">
              <button
                className="btn p-0 border-0 dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-semibold shadow-sm"
                  style={{ width: 34, height: 34, fontSize: 14 }}
                >
                  U
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li className="px-3 py-2">
                  <div className="fw-semibold small">Usuario</div>
                  <div className="text-muted small">usuario@controlmed</div>
                </li>

                <li><hr className="dropdown-divider" /></li>

                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => navigate(routes.PROFILE)}
                  >
                    Perfil
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container-fluid px-4 py-4 bg-body">
        <Outlet />
      </main>
    </>
  );
}
