import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    phone: '',
    facebook: '',
    zaloName: '',
    role: 'member',
  });
  const [error, setError] = useState('');

  const load = () => {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    api(`/users${params}`).then(setMembers).catch(console.error);
  };

  useEffect(() => {
    load();
  }, [q]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ username: '', password: '', displayName: '', phone: '', facebook: '', zaloName: '', role: 'member' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa thành viên "${name}"?`)) return;
    await api(`/users/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Thành viên</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + Thêm thành viên
        </button>
      </div>

      <input
        className="search-input card"
        placeholder="Tìm theo tên, SĐT, Zalo..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem' }}
      />

      {showForm && (
        <form className="card" onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Thêm thành viên mới</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Tên đăng nhập *</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Tên hiển thị *</label>
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
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
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
        </form>
      )}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id}>
                <td>
                  <Link to={`/thanh-vien/${m._id}`}>{m.displayName}</Link>
                </td>
                <td>
                  {[m.phone, m.zaloName, m.facebook].filter(Boolean).join(' · ') || '—'}
                </td>
                <td>
                  <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                    {m.role}
                  </span>
                </td>
                <td>
                  {m.role !== 'admin' && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id, m.displayName)}>
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <p className="empty">Không có thành viên</p>}
      </div>
    </div>
  );
}
