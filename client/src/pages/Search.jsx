import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import AsyncCombobox from '../components/AsyncCombobox';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [flowerResult, setFlowerResult] = useState(null);
  const [flowerLoading, setFlowerLoading] = useState(false);
  const [selectedFlowerLabel, setSelectedFlowerLabel] = useState(initialQ);
  const [selectedFlowerId, setSelectedFlowerId] = useState('');

  const cacheRef = useRef(new Map());
  const flowerAbortRef = useRef(null);

  const fetchMembers = useCallback(async (q) => {
    if (!q) return [];
    return api(`/search/members?q=${encodeURIComponent(q)}`);
  }, []);

  const fetchFlowerOptions = useCallback(async (q) => {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return api(`/flowers${params}`);
  }, []);

  const loadFlowerHolders = useCallback(async (flower) => {
    if (!flower) {
      setFlowerResult(null);
      setSelectedFlowerLabel('');
      setSelectedFlowerId('');
      return;
    }

    flowerAbortRef.current?.abort();
    const path = `/search/flowers?flowerId=${encodeURIComponent(flower._id)}`;
    const cached = readCache(cacheRef.current, path);
    if (cached !== null) {
      setFlowerResult(cached);
      setSelectedFlowerLabel(flower.flowerName);
      setSelectedFlowerId(flower._id);
      return;
    }

    const controller = new AbortController();
    flowerAbortRef.current = controller;
    setFlowerLoading(true);

    try {
      const data = await api(path, { signal: controller.signal });
      writeCache(cacheRef.current, path, data);
      setFlowerResult(data);
      setSelectedFlowerLabel(flower.flowerName);
      setSelectedFlowerId(flower._id);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setFlowerResult(null);
    } finally {
      setFlowerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialQ.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const list = await api(`/flowers?q=${encodeURIComponent(initialQ.trim())}`);
        if (!cancelled && list.length > 0) {
          await loadFlowerHolders(list[0]);
        } else if (!cancelled) {
          setFlowerResult({
            flower: null,
            holders: [],
            message: 'Không tìm thấy loại hoa trong danh mục',
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialQ, loadFlowerHolders]);

  return (
    <div>
      <h1 className="page-title">Tìm kiếm</h1>

      <div className="grid-2 align-start">
        <div className="card">
          <h3 className="card-title">Tìm thành viên</h3>
          <p className="search-combobox-hint muted">Gõ tên — gợi ý gần đúng, chọn để mở hồ sơ</p>
          <AsyncCombobox
            fetchOptions={fetchMembers}
            getOptionKey={(m) => m._id}
            getOptionLabel={(m) => m.displayName}
            renderOption={(m) => (
              <>
                {m.displayName}
                {m.phone && <span className="muted"> · {m.phone}</span>}
              </>
            )}
            onSelect={(member) => {
              if (member) navigate(`/thanh-vien/${member._id}`);
            }}
            placeholder="Nhập tên thành viên..."
            minChars={1}
            emptyMessage="Không tìm thấy thành viên"
            hintMessage="Nhập ít nhất 1 ký tự để tìm"
            clearable
          />
        </div>

        <div className="card">
          <h3 className="card-title">Tìm loại hoa (ai đang có?)</h3>
          <p className="search-combobox-hint muted">Gõ tên hoa — gợi ý gần đúng, chọn để xem ai đang có</p>
          <AsyncCombobox
            fetchOptions={fetchFlowerOptions}
            getOptionKey={(f) => f._id}
            getOptionLabel={(f) => f.flowerName}
            onSelect={(flower) => loadFlowerHolders(flower)}
            placeholder="VD: Juliet"
            initialQuery={initialQ}
            selectedLabel={selectedFlowerLabel}
            valueId={selectedFlowerId}
            minChars={0}
            emptyMessage="Không tìm thấy loại hoa"
            hintMessage="Gõ tên hoa để tìm"
            clearable
          />

          {flowerLoading && (
            <p className="search-hint muted">
              <span className="loading-spinner loading-spinner-inline" /> Đang tải...
            </p>
          )}

          {flowerResult && !flowerLoading && (
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
