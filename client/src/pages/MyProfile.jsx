import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

export default function MyProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    facebook: user?.facebook || '',
    zaloName: user?.zaloName || '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      await api(`/users/${user._id}`, { method: 'PUT', body: JSON.stringify(body) });
      setMsg('Đã lưu thông tin');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Hồ sơ của tôi</h1>

      <div className="grid-2 align-start">
        <form className="card" onSubmit={handleSave}>
          <h3 className="card-title">Thông tin cá nhân</h3>
          <div className="form-group">
            <label>Tên hiển thị *</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Facebook</label>
            <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Tên Zalo</label>
            <input value={form.zaloName} onChange={(e) => setForm({ ...form, zaloName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Đổi mật khẩu (để trống nếu không đổi)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {msg && <p className="success-msg">{msg}</p>}
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Lưu thông tin</button>
        </form>

        <div className="card">
          <h3 className="card-title">Quản lý hoa của bạn</h3>
          <p className="card-muted">
            Cập nhật hoa đang có, gốc trồng và hoa chờ bồi.
          </p>
          <Link to={`/thanh-vien/${user._id}`} className="btn btn-primary btn-block">
            Mở hồ sơ hoa →
          </Link>
        </div>
      </div>
    </div>
  );
}
