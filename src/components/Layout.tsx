import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">Manager Library</div>
        <nav>
          <NavLink to="/books">Catálogo</NavLink>
          <NavLink to="/members">Socios</NavLink>
          <NavLink to="/loans">Préstamos</NavLink>
          <NavLink to="/overdue">Vencidos</NavLink>
          <NavLink to="/report">Reporte</NavLink>
        </nav>
        <div className="topbar-right">
          <span className="role-badge">{role}</span>
          <button type="button" className="linkish" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
