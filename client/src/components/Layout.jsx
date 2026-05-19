import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌸</span>
          <span>Hội Chơi Hoa</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>Dashboard</NavLink>
          {isAdmin && <NavLink to="/thanh-vien">Thành viên</NavLink>}
          <NavLink to="/ho-so">Hồ sơ của tôi</NavLink>
          {isAdmin && <NavLink to="/hoa">Danh sách hoa</NavLink>}
          <NavLink to="/tim-kiem">Tìm kiếm</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p className="user-name">{user?.displayName}</p>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
            {isAdmin ? 'Admin' : 'Thành viên'}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
