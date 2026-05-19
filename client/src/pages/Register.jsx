import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    facebook: '',
    zaloName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        displayName: form.displayName,
        phone: form.phone,
        facebook: form.facebook,
        zaloName: form.zaloName,
      });
      navigate('/ho-so');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card auth-card-wide">
        <h1>🌸 Đăng ký thành viên</h1>
        <p className="login-sub">Tạo tài khoản để tham gia Hội Chơi Hoa</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập *</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label>Tên hiển thị *</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu * (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Facebook</label>
            <input
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Tên Zalo</label>
            <input
              value={form.zaloName}
              onChange={(e) => setForm({ ...form, zaloName: e.target.value })}
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
