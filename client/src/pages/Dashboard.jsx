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

  if (!data) {
    return (
      <div className="loading-state">
        <span className="loading-spinner" />
        Đang tải...
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Vườn nhà</h1>
      <p className="page-lead">Tổng quan hội chơi hoa — ai đang có gì và vườn vừa cập nhật.</p>

      <div className="grid-2 mb-15">
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
          <h3 className="card-title">Hoa phổ biến nhất</h3>
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
          <h3 className="card-title">Cập nhật gần đây</h3>
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
    </div>
  );
}
