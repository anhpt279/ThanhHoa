import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setData).catch(console.error);
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card">
          <h3>Tổng thành viên</h3>
          <p className="value">{data.totalMembers}</p>
        </div>
        <div className="card stat-card">
          <h3>Loại hoa trong danh mục</h3>
          <p className="value">{data.flowerTypeCount}</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Hoa phổ biến nhất</h3>
          {data.popularFlowers?.length === 0 ? (
            <p className="empty">Chưa có dữ liệu</p>
          ) : (
            <ul className="simple-list">
              {data.popularFlowers.map((f) => (
                <li key={f.flowerName}>
                  <Link to={`/tim-kiem?q=${encodeURIComponent(f.flowerName)}`}>
                    {f.flowerName}
                  </Link>
                  <span className="muted"> — {f.totalQuantity} cây ({f.holderCount} người)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Cập nhật gần đây</h3>
          {data.recentMembers?.length === 0 ? (
            <p className="empty">Chưa có dữ liệu</p>
          ) : (
            <ul className="simple-list">
              {data.recentMembers.map((m) => (
                <li key={m._id}>
                  {isAdmin ? (
                    <Link to={`/thanh-vien/${m._id}`}>{m.displayName}</Link>
                  ) : (
                    <span>{m.displayName}</span>
                  )}
                  <span className="muted">
                    {' '}
                    — {new Date(m.lastUpdatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .simple-list { list-style: none; }
        .simple-list li { padding: 0.4rem 0; border-bottom: 1px solid var(--border); }
        .simple-list li:last-child { border-bottom: none; }
        .muted { color: var(--muted); font-size: 0.875rem; }
      `}</style>
    </div>
  );
}
