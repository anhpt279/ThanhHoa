import { useEffect, useState } from 'react';
import { api } from '../api/client';

const DUPLICATE_MSG = 'Loại hoa đã tồn tại';

function normalizeFlowerName(name) {
  return name.trim().toLowerCase();
}

function findDuplicateFlower(name, flowers, excludeId) {
  const key = normalizeFlowerName(name);
  return flowers.find(
    (f) => normalizeFlowerName(f.flowerName) === key && String(f._id) !== String(excludeId ?? '')
  );
}

const PAGE_SIZE = 10;

export default function Flowers() {
  const [flowers, setFlowers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async (pageNum = page) => {
    try {
      const data = await api(`/flowers?page=${pageNum}&limit=${PAGE_SIZE}`);
      setFlowers(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tên hoa không được trống');
      return;
    }

    if (findDuplicateFlower(trimmed, flowers, editing)) {
      setError(DUPLICATE_MSG);
      return;
    }

    try {
      if (editing) {
        await api(`/flowers/${editing}`, { method: 'PUT', body: JSON.stringify({ flowerName: trimmed }) });
      } else {
        await api('/flowers', { method: 'POST', body: JSON.stringify({ flowerName: trimmed }) });
      }
      setName('');
      setEditing(null);
      await load(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (f) => {
    setEditing(f._id);
    setName(f.flowerName);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa loại hoa này?')) return;
    await api(`/flowers/${id}`, { method: 'DELETE' });
    const nextPage = flowers.length === 1 && page > 1 ? page - 1 : page;
    if (nextPage !== page) {
      setPage(nextPage);
    } else {
      await load(page);
    }
  };

  return (
    <div>
      <h1 className="page-title">Loại hoa</h1>
      <p className="page-lead">
        Danh mục loài hoa — thành viên chọn từ đây khi cập nhật vườn.
      </p>

      <form className="card mb-15 flower-form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{editing ? 'Sửa tên hoa' : 'Tên hoa mới'}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Thêm'}</button>
          {editing && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setName(''); setError(''); }}>
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên hoa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {flowers.map((f, i) => (
              <tr key={f._id}>
                <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td>{f.flowerName}</td>
                <td className="actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(f)}>Sửa</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total === 0 && <p className="empty">Chưa có loại hoa nào</p>}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Phân trang danh sách hoa">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span className="pagination-info">
              Trang {page} / {totalPages}
              <span className="pagination-total"> ({total} loại)</span>
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
