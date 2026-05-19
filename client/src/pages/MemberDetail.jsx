import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FlowerSection from '../components/FlowerSection';

export default function MemberDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [flowers, setFlowers] = useState([]);

  const load = () => {
    api(`/users/${id}`).then(setProfile).catch(console.error);
    api('/flowers').then(setFlowers).catch(console.error);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!profile) return <p>Đang tải...</p>;

  const { user: member, flowers: grouped } = profile;
  const canEdit = isAdmin || String(user?._id) === id;

  return (
    <div>
      <Link to={isAdmin ? '/thanh-vien' : '/ho-so'} style={{ fontSize: '0.9rem' }}>
        ← Quay lại
      </Link>
      <h1 className="page-title">{member.displayName}</h1>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p><strong>SĐT:</strong> {member.phone || '—'}</p>
        <p><strong>Facebook:</strong> {member.facebook || '—'}</p>
        <p><strong>Zalo:</strong> {member.zaloName || '—'}</p>
      </div>

      <div className="flower-sections">
        <FlowerSection
          userId={id}
          type="owning"
          items={grouped.owning}
          flowers={flowers}
          canEdit={canEdit}
          onRefresh={load}
        />
        <FlowerSection
          userId={id}
          type="root_stock"
          items={grouped.root_stock}
          flowers={flowers}
          canEdit={canEdit}
          onRefresh={load}
        />
        <FlowerSection
          userId={id}
          type="waiting_graft"
          items={grouped.waiting_graft}
          flowers={flowers}
          canEdit={canEdit}
          onRefresh={load}
        />
      </div>

      <style>{`
        .flower-sections { display: flex; flex-direction: column; gap: 1rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .section-header h3 { margin: 0; font-size: 1rem; }
        .inline-form { margin-bottom: 1rem; padding: 1rem; background: var(--bg); border-radius: 8px; }
        .form-actions { display: flex; gap: 0.5rem; }
        .actions { white-space: nowrap; }
        .actions .btn { margin-right: 0.25rem; }
      `}</style>
    </div>
  );
}
