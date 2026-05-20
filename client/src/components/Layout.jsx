import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: '📊' },
  { to: '/thanh-vien', label: 'Thành viên', admin: true, icon: '👥' },
  { to: '/ho-so', label: 'Hồ sơ của tôi', icon: '👤' },
  { to: '/hoa', label: 'Danh sách hoa', admin: true, icon: '🌹' },
  { to: '/tim-kiem', label: 'Tìm kiếm', icon: '🔍' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = NAV_ITEMS.filter((item) => !item.admin || isAdmin);

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>
        <div className="mobile-brand">
          <span className="brand-icon">🌸</span>
          <span>Hội Chơi Hoa</span>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Đóng menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand desktop-only">
          <span className="brand-icon">🌸</span>
          <span>Hội Chơi Hoa</span>
        </div>

        <nav className="nav">
          {navLinks.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span className="nav-icon" aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <p className="user-name">{user?.displayName}</p>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
              {isAdmin ? 'Admin' : 'Thành viên'}
            </span>
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
