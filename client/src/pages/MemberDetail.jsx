import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FlowerSection from '../components/FlowerSection';

export default function MemberDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);

  const load = () => {
    api(`/users/${id}`).then(setProfile).catch(console.error);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!profile) {
    return (
      <div className="loading-state">
        <span className="loading-spinner" />
        Đang tải...
      </div>
    );
  }

  const { user: member, flowers: grouped } = profile;
  const canEdit = isAdmin || String(user?._id) === id;

  return (
    <div>
      <Link to={isAdmin ? '/thanh-vien' : '/ho-so'} className="back-link">
        ← Quay lại
      </Link>
      <h1 className="page-title">{member.displayName}</h1>

      <div className="card mb-15 profile-info">
        <div className="profile-info-row">
          <strong>SĐT</strong>
          <span>{member.phone || '—'}</span>
        </div>
        <div className="profile-info-row">
          <strong>Facebook</strong>
          <span>{member.facebook || '—'}</span>
        </div>
        <div className="profile-info-row">
          <strong>Zalo</strong>
          <span>{member.zaloName || '—'}</span>
        </div>
      </div>

      <div className="flower-sections">
        <FlowerSection userId={id} type="owning" items={grouped.owning} canEdit={canEdit} onRefresh={load} />
        <FlowerSection userId={id} type="root_stock" items={grouped.root_stock} canEdit={canEdit} onRefresh={load} />
        <FlowerSection userId={id} type="waiting_graft" items={grouped.waiting_graft} canEdit={canEdit} onRefresh={load} />
      </div>
    </div>
  );
}
