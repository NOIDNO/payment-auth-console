import { NavLink, Outlet } from 'react-router-dom';
import { logout } from '../api/auth';
import './Layout.css';

const Layout = ({ user }) => {
  const handleLogout = async () => {
    await logout();
    window.location.href = 'http://localhost:4000/login';
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__brand-mark">OHY</span>
          <strong>결제인증 관리</strong>
        </div>
        <div className="app-header__right">
          {user && <span className="app-header__user">{user.name}님</span>}
          <button className="app-header__logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="app-body">
        <nav className="app-sidebar">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
            }
          >
            대시보드
          </NavLink>
           <NavLink
    to="/payments"
    className={({ isActive }) =>
      `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
    }
  >
    결제내역 조회
  </NavLink>
        </nav>
        

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;