import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

const CACHE_TTL_MS = 60_000;

function readCache(cache, key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;
  return null;
}

function writeCache(cache, key, data) {
  cache.set(key, { data, at: Date.now() });
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [memberQ, setMemberQ] = useState('');
  const [flowerQ, setFlowerQ] = useState(initialQ);
  const [members, setMembers] = useState([]);
  const [flowerResult, setFlowerResult] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [flowerLoading, setFlowerLoading] = useState(false);

  const cacheRef = useRef(new Map());
  const memberAbortRef = useRef(null);
  const flowerAbortRef = useRef(null);

  const fetchCached = async (path, { signal, setLoading, setData, empty }) => {
    const cached = readCache(cacheRef.current, path);
    if (cached !== null) {
      setData(cached);
      return;
    }

    setLoading(true);
    try {
      const data = await api(path, { signal });
      writeCache(cacheRef.current, path, data);
      setData(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setData(empty);
    } finally {
      setLoading(false);
    }
  };

  const searchMembers = async (e) => {
    e?.preventDefault();
    memberAbortRef.current?.abort();
    if (!memberQ.trim()) {
      setMembers([]);
      return;
    }

    const path = `/search/members?q=${encodeURIComponent(memberQ.trim())}`;
    const controller = new AbortController();
    memberAbortRef.current = controller;

    await fetchCached(path, {
      signal: controller.signal,
      setLoading: setMemberLoading,
      setData: setMembers,
      empty: [],
    });
  };

  const searchFlowers = async (e) => {
    e?.preventDefault();
    flowerAbortRef.current?.abort();
    if (!flowerQ.trim()) {
      setFlowerResult(null);
      return;
    }

    const path = `/search/flowers?q=${encodeURIComponent(flowerQ.trim())}`;
    const controller = new AbortController();
    flowerAbortRef.current = controller;

    await fetchCached(path, {
      signal: controller.signal,
      setLoading: setFlowerLoading,
      setData: setFlowerResult,
      empty: null,
    });
  };

  useEffect(() => {
    if (!initialQ.trim()) return;

    flowerAbortRef.current?.abort();
    const path = `/search/flowers?q=${encodeURIComponent(initialQ.trim())}`;
    const controller = new AbortController();
    flowerAbortRef.current = controller;

    fetchCached(path, {
      signal: controller.signal,
      setLoading: setFlowerLoading,
      setData: setFlowerResult,
      empty: null,
    });

    return () => controller.abort();
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
            <button type="submit" className="btn btn-primary" disabled={memberLoading}>
              {memberLoading ? 'Đang tìm...' : 'Tìm'}
            </button>
          </form>
          {memberLoading && members.length === 0 && (
            <p className="search-hint muted">
              <span className="loading-spinner loading-spinner-inline" /> Đang tìm...
            </p>
          )}
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
            <button type="submit" className="btn btn-primary" disabled={flowerLoading}>
              {flowerLoading ? 'Đang tìm...' : 'Tìm'}
            </button>
          </form>

          {flowerLoading && !flowerResult && (
            <p className="search-hint muted">
              <span className="loading-spinner loading-spinner-inline" /> Đang tìm...
            </p>
          )}

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
