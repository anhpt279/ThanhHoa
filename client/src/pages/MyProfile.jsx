import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import FlowerSection from '../components/FlowerSection';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    facebook: user?.facebook || '',
    zaloName: user?.zaloName || '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    if (!user?._id) return;
    api(`/users/${user._id}`)
      .then((data) => {
        setProfile(data);
        setForm({
          displayName: data.user.displayName || '',
          phone: data.user.phone || '',
          facebook: data.user.facebook || '',
          zaloName: data.user.zaloName || '',
          password: '',
        });
      })
      .catch(console.error);
  };

  useEffect(() => {
    load();
  }, [user?._id]);

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
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!profile) {
    return (
      <div className="loading-state">
        <span className="loading-spinner" />
        Đang tải...
      </div>
    );
  }

  const { flowers: grouped } = profile;

  return (
    <div className="my-profile">
      <header className="my-profile-header">
        <h1 className="page-title">Quản lý hoa của bạn</h1>
        <p className="my-profile-subtitle">
          Xin chào, <strong>{profile.user.displayName}</strong> — cập nhật hoa đang có.
        </p>
      </header>

      <div className="flower-sections my-profile-flowers">
        <FlowerSection
          userId={user._id}
          type="owning"
          items={grouped.owning}
          canEdit
          onRefresh={load}
        />
      </div>

      <details className="my-profile-personal card">
        <summary className="my-profile-personal-summary">Thông tin cá nhân</summary>
        <form className="my-profile-personal-form" onSubmit={handleSave}>
          <div className="grid-2">
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
          <button type="submit" className="btn btn-secondary btn-sm">
            Lưu thông tin
          </button>
        </form>
      </details>
    </div>
  );
}
