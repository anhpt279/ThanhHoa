import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [memberQ, setMemberQ] = useState('');
  const [flowerQ, setFlowerQ] = useState(initialQ);
  const [members, setMembers] = useState([]);
  const [flowerResult, setFlowerResult] = useState(null);

  const searchMembers = async (e) => {
    e?.preventDefault();
    if (!memberQ.trim()) return setMembers([]);
    const data = await api(`/search/members?q=${encodeURIComponent(memberQ)}`);
    setMembers(data);
  };

  const searchFlowers = async (e) => {
    e?.preventDefault();
    if (!flowerQ.trim()) return setFlowerResult(null);
    const data = await api(`/search/flowers?q=${encodeURIComponent(flowerQ)}`);
    setFlowerResult(data);
  };

  useEffect(() => {
    if (initialQ.trim()) {
      api(`/search/flowers?q=${encodeURIComponent(initialQ)}`).then(setFlowerResult).catch(console.error);
    }
  }, [initialQ]);

  return (
    <div>
      <h1 className="page-title">Tìm kiếm</h1>

      <div className="grid-2 align-start">
        <div className="card">
          <h3 className="card-title">Tìm thành viên</h3>
          <form onSubmit={searchMembers} className="search-row">
            <input
              placeholder="Nhập tên..."
              value={memberQ}
              onChange={(e) => setMemberQ(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Tìm</button>
          </form>
          {members.length > 0 && (
            <ul className="result-list">
              {members.map((m) => (
                <li key={m._id}>
                  <Link to={`/thanh-vien/${m._id}`}>{m.displayName}</Link>
                  {m.phone && <span className="muted"> · {m.phone}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Tìm loại hoa (ai đang có?)</h3>
          <form onSubmit={searchFlowers} className="search-row">
            <input
              placeholder="VD: Juliet"
              value={flowerQ}
              onChange={(e) => setFlowerQ(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Tìm</button>
          </form>

          {flowerResult && (
            <>
              {!flowerResult.flower ? (
                <p className="empty">{flowerResult.message || 'Không tìm thấy'}</p>
              ) : (
                <>
                  <p className="mb-1">
                    <strong>{flowerResult.flower.flowerName}</strong>
                    {' '}— Tổng <strong>{flowerResult.totalQuantity}</strong> cây
                    ({flowerResult.holderCount} thành viên)
                  </p>
                  {flowerResult.holders.length === 0 ? (
                    <p className="empty">Chưa ai có loại hoa này</p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Thành viên</th>
                            <th>Số lượng</th>
                            <th>Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {flowerResult.holders.map((h) => (
                            <tr key={h.user._id}>
                              <td>
                                <Link to={`/thanh-vien/${h.user._id}`}>{h.user.displayName}</Link>
                              </td>
                              <td><strong>{h.quantity}</strong> cây</td>
                              <td>{h.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
