import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import FlowerCombobox from './FlowerCombobox';

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  owning: 'Hoa đang sở hữu',
  root_stock: 'Gốc có thể trồng',
  waiting_graft: 'Hoa chờ bồi',
};

function displayName(item) {
  if (item.type === 'root_stock') return item.customName;
  return item.flowerId?.flowerName || '—';
}

function matchesSearch(item, type, q) {
  const name = displayName(item).toLowerCase();
  const note = (item.note || '').toLowerCase();
  const qty = type === 'owning' ? String(item.quantity ?? '') : '';
  return name.includes(q) || note.includes(q) || qty.includes(q);
}

export default function FlowerSection({ userId, type, items, canEdit, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    flowerId: '',
    flowerName: '',
    customName: '',
    quantity: 1,
    note: '',
  });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const excludeFlowerIds = items
    .filter((i) => i._id !== editingId && i.flowerId?._id)
    .map((i) => i.flowerId._id);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => matchesSearch(item, type, q));
  }, [items, searchQuery, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetForm = () => {
    setForm({ flowerId: '', flowerName: '', customName: '', quantity: 1, note: '' });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api(`/user-flowers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            flowerId: form.flowerId || undefined,
            customName: form.customName,
            quantity: Number(form.quantity),
            note: form.note,
          }),
        });
      } else {
        await api('/user-flowers', {
          method: 'POST',
          body: JSON.stringify({
            userId,
            type,
            flowerId: form.flowerId || undefined,
            customName: form.customName,
            quantity: Number(form.quantity),
            note: form.note,
          }),
        });
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      flowerId: item.flowerId?._id || '',
      flowerName: item.flowerId?.flowerName || '',
      customName: item.customName || '',
      quantity: item.quantity ?? 1,
      note: item.note || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa mục này?')) return;
    try {
      await api(`/user-flowers/${id}`, { method: 'DELETE' });
      const nextPage = pageItems.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="card flower-section">
      <div className="section-header">
        <h3>{TYPE_LABELS[type]}</h3>
        {canEdit && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
            + Thêm
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <form className="inline-form" onSubmit={handleSubmit}>
          {type === 'root_stock' ? (
            <div className="form-group">
              <label>Tên gốc</label>
              <input
                value={form.customName}
                onChange={(e) => setForm({ ...form, customName: e.target.value })}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Loại hoa</label>
              <FlowerCombobox
                value={form.flowerId}
                selectedLabel={form.flowerName}
                excludeIds={excludeFlowerIds}
                required
                onChange={(id, name) => setForm((f) => ({ ...f, flowerId: id, flowerName: name }))}
              />
            </div>
          )}
          {type === 'owning' && (
            <div className="form-group">
              <label>Số lượng</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label>Ghi chú</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={type !== 'root_stock' && !form.flowerId}>
              Lưu
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
              Hủy
            </button>
          </div>
        </form>
      )}

      {items.length > 0 && (
        <input
          className="search-input flower-section-search"
          placeholder={
            type === 'root_stock'
              ? 'Tìm theo tên gốc, ghi chú...'
              : 'Tìm theo tên hoa, ghi chú, số lượng...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {items.length === 0 ? (
        <p className="empty">Chưa có dữ liệu</p>
      ) : filtered.length === 0 ? (
        <p className="empty">Không tìm thấy</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{type === 'root_stock' ? 'Loại gốc' : 'Hoa'}</th>
                {type === 'owning' && <th>Số lượng</th>}
                <th>Ghi chú</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item._id}>
                  <td>{displayName(item)}</td>
                  {type === 'owning' && <td>{item.quantity}</td>}
                  <td>{item.note || '—'}</td>
                  {canEdit && (
                    <td className="actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>
                        Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <nav className="pagination" aria-label={`Phân trang ${TYPE_LABELS[type]}`}>
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
                <span className="pagination-total"> ({filtered.length} mục)</span>
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
      )}
    </section>
  );
}
