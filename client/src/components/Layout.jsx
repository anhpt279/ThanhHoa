import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark, NavIcon } from './Icons';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Vườn nhà', end: true, icon: 'garden' },
  { to: '/thanh-vien', label: 'Thành viên', admin: true, icon: 'members' },
  { to: '/ho-so', label: 'Hoa của tôi', icon: 'profile' },
  { to: '/hoa', label: 'Loại hoa', admin: true, icon: 'flowers' },
  { to: '/tim-kiem', label: 'Tìm kiếm', icon: 'search' },
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
          <BrandMark className="brand-mark--sm" />
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
          <BrandMark />
          <div className="brand-text">
            <span className="brand-title">Hội Chơi Hoa</span>
            <span className="brand-tagline">Vườn chibi của bạn</span>
          </div>
        </div>

        <nav className="nav">
          {navLinks.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <p className="user-name">{user?.displayName}</p>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
              {isAdmin ? 'Người chăm vườn' : 'Người chơi'}
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
