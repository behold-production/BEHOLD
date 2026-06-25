import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw, AlertTriangle, Clock, User, Brain, Calendar, RotateCcw, X, Zap, Loader } from 'lucide-react';
import ApiService from '../../../../shared/services/api';

function daysRemaining(deletedAt) {
  if (!deletedAt) return 0;
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function CountdownBar({ deletedAt }) {
  const days = daysRemaining(deletedAt);
  const pct = Math.max(0, Math.min(100, (days / 30) * 100));
  const color = days <= 3 ? '#ff4444' : days <= 10 ? '#ff8800' : '#00d9ff';
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> {days} day{days !== 1 ? 's' : ''} remaining
        </span>
        <span style={{ fontSize: 11, color: days <= 3 ? '#ff4444' : '#aaa' }}>
          {days <= 3 ? '⚠ Expiring soon' : 'Restorable'}
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
        <div style={{
          width: pct + '%',
          height: '100%',
          background: 'linear-gradient(90deg, ' + color + '88, ' + color + ')',
          borderRadius: 99,
          boxShadow: '0 0 8px ' + color + '88',
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  );
}

function TrashCard({ icon: Icon, title, subtitle, meta, deletedAt, onRestore, onPermanent, isRestoring, isDeleting }) {
  const days = daysRemaining(deletedAt);
  const urgent = days <= 3;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid ' + (urgent ? 'rgba(255,68,68,0.4)' : 'rgba(0,217,255,0.15)'),
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      backdropFilter: 'blur(12px)',
      boxShadow: urgent ? '0 0 18px rgba(255,68,68,0.1) inset' : '0 0 18px rgba(0,217,255,0.05) inset',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: urgent ? 'rgba(255,68,68,0.15)' : 'rgba(0,217,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: '1px solid ' + (urgent ? 'rgba(255,68,68,0.3)' : 'rgba(0,217,255,0.2)')
        }}>
          <Icon size={18} color={urgent ? '#ff4444' : '#00d9ff'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: '#eee', fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>{subtitle}</div>
          {meta && <div style={{ color: '#666', fontSize: 11 }}>{meta}</div>}
        </div>
      </div>
      <CountdownBar deletedAt={deletedAt} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onRestore} disabled={isRestoring || isDeleting} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid rgba(0,217,255,0.3)',
          background: 'rgba(0,217,255,0.1)', color: '#00d9ff', fontWeight: 600, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer',
          boxShadow: '0 0 12px rgba(0,217,255,0.1)', transition: 'all 0.2s ease'
        }}>
          <RotateCcw size={12} />
          {isRestoring ? 'Restoring…' : 'Restore'}
        </button>
        <button onClick={onPermanent} disabled={isRestoring || isDeleting} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid rgba(255,68,68,0.3)',
          background: 'rgba(255,68,68,0.1)', color: '#ff4444', fontWeight: 600, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <X size={12} />
          {isDeleting ? 'Deleting…' : 'Delete Forever'}
        </button>
      </div>
    </div>
  );
}

function EmptyTrash({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
      }}>
        <Trash2 size={28} color="#444" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#666', marginBottom: 6 }}>No deleted {label}</div>
      <div style={{ fontSize: 13, color: '#444' }}>Items you delete will appear here for 30 days before being permanently removed.</div>
    </div>
  );
}

export default function TrashTab({ showAlert, showConfirm, reloadData }) {
  const [trashData, setTrashData] = useState({ counsellors: [], users: [], appointments: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [activeTab, setActiveTab] = useState('counsellors');
  const [actionState, setActionState] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadTrash = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getTrashItems();
      if (res.success) setTrashData(res.data);
    } catch (err) {
      console.error('Failed to load trash:', err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTrash();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTrash]);

  const setAction = (id, key, val) => setActionState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: val } }));

  const handleRestoreCounsellor = async (id) => {
    if (!await showConfirm('Restore this psychologist? Their account and bookings will be fully reinstated.')) return;
    setAction(id, 'restoring', true);
    try {
      await ApiService.restoreCounsellor(id);
      await showAlert('Psychologist restored successfully!');
      loadTrash(); if (reloadData) reloadData();
    } catch (err) { await showAlert(err.message || 'Failed to restore.'); }
    setAction(id, 'restoring', false);
  };

  const handlePermanentDeleteCounsellor = async (id) => {
    if (!await showConfirm('PERMANENTLY DELETE this psychologist? This CANNOT be undone. All their data will be lost forever.')) return;
    setAction(id, 'deleting', true);
    try {
      await ApiService.permanentDeleteCounsellor(id);
      await showAlert('Psychologist permanently deleted.');
      loadTrash(); if (reloadData) reloadData();
    } catch (err) { await showAlert(err.message || 'Failed to delete.'); }
    setAction(id, 'deleting', false);
  };

  const handleRestoreUser = async (id) => {
    if (!await showConfirm('Restore this student? Their account and bookings will be fully reinstated.')) return;
    setAction(id, 'restoring', true);
    try {
      await ApiService.restoreUser(id);
      await showAlert('Student restored successfully!');
      loadTrash(); if (reloadData) reloadData();
    } catch (err) { await showAlert(err.message || 'Failed to restore.'); }
    setAction(id, 'restoring', false);
  };

  const handlePermanentDeleteUser = async (id) => {
    if (!await showConfirm('PERMANENTLY DELETE this student? This CANNOT be undone.')) return;
    setAction(id, 'deleting', true);
    try {
      await ApiService.permanentDeleteUser(id);
      await showAlert('Student permanently deleted.');
      loadTrash(); if (reloadData) reloadData();
    } catch (err) { await showAlert(err.message || 'Failed to delete.'); }
    setAction(id, 'deleting', false);
  };

  const handleRestoreAppointment = async (id) => {
    if (!await showConfirm('Restore this booking?')) return;
    setAction(id, 'restoring', true);
    try {
      await ApiService.restoreAppointment(id);
      await showAlert('Booking restored successfully!');
      loadTrash(); if (reloadData) reloadData();
    } catch (err) { await showAlert(err.message || 'Failed to restore.'); }
    setAction(id, 'restoring', false);
  };

  const handlePurge = async () => {
    if (!await showConfirm('Purge all items in trash for over 30 days? This will permanently delete them.')) return;
    setIsPurging(true);
    try {
      const res = await ApiService.purgeExpiredTrash();
      if (res.success) {
        const { counsellorsRemoved, usersRemoved, appointmentsRemoved } = res.data;
        await showAlert('Purge complete! Removed: ' + counsellorsRemoved + ' psychologist(s), ' + usersRemoved + ' student(s), ' + appointmentsRemoved + ' booking(s).');
        loadTrash(); if (reloadData) reloadData();
      }
    } catch (err) { await showAlert(err.message || 'Purge failed.'); }
    setIsPurging(false);
  };

  const totalCount = trashData.counsellors.length + trashData.users.length + trashData.appointments.length;

  const tabs = [
    { id: 'counsellors', label: 'Psychologists', icon: Brain, count: trashData.counsellors.length },
    { id: 'users', label: 'Students', icon: User, count: trashData.users.length },
    { id: 'appointments', label: 'Bookings', icon: Calendar, count: trashData.appointments.length },
  ];

  const filterSearch = (items, fields) => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(item => fields.some(f => (item[f] || '').toLowerCase().includes(q)));
  };

  const filteredCounsellors = filterSearch(trashData.counsellors, ['name', 'email', 'title']);
  const filteredUsers = filterSearch(trashData.users, ['name', 'email', 'schoolName']);
  const filteredAppointments = filterSearch(trashData.appointments, ['userId', 'counsellorId', 'date', 'mode', 'status']);

  return (
    <div style={{ padding: '20px 0', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .trash-tab-btn:hover { background: rgba(0,217,255,0.12) !important; color: #00d9ff !important; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(255,68,68,0.2), rgba(255,136,0,0.15))',
            border: '1px solid rgba(255,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,68,68,0.2)'
          }}>
            <Trash2 size={20} color="#ff4444" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 10 }}>
              Trash
              {totalCount > 0 && (
                <span style={{ fontSize: 13, background: 'rgba(255,68,68,0.2)', color: '#ff6666', padding: '2px 10px', borderRadius: 99, border: '1px solid rgba(255,68,68,0.3)' }}>
                  {totalCount}
                </span>
              )}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Deleted items are kept for 30 days before permanent removal</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadTrash} disabled={isLoading} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(0,217,255,0.25)', background: 'rgba(0,217,255,0.08)', color: '#00d9ff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} style={isLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
          <button onClick={handlePurge} disabled={isPurging} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.12)', color: '#ff4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 12px rgba(255,68,68,0.1)' }}>
            {isPurging ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
            Purge Expired
          </button>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(255,136,0,0.08), rgba(255,68,68,0.06))', border: '1px solid rgba(255,136,0,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <AlertTriangle size={16} color="#ff8800" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: '#cc9944', lineHeight: 1.5 }}>
          <strong style={{ color: '#ffaa44' }}>Meta-style Trash System:</strong> Deleted items are moved here for a 30-day grace period. You can restore any item before it expires. When a psychologist is deleted, all their bookings are soft-deleted too — restoring the psychologist also restores their bookings.
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input type="text" placeholder="Search in trash…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.id} className="trash-tab-btn" onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid ' + (activeTab === tab.id ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.1)'),
            background: activeTab === tab.id ? 'rgba(0,217,255,0.15)' : 'rgba(255,255,255,0.04)',
            color: activeTab === tab.id ? '#00d9ff' : '#888', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease'
          }}>
            <tab.icon size={13} />
            {tab.label}
            {tab.count > 0 && <span style={{ background: activeTab === tab.id ? 'rgba(0,217,255,0.2)' : 'rgba(255,255,255,0.1)', padding: '1px 7px', borderRadius: 99, fontSize: 11 }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div>Loading trash…</div>
        </div>
      ) : (
        <>
          {activeTab === 'counsellors' && (filteredCounsellors.length === 0 ? <EmptyTrash label="psychologists" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {filteredCounsellors.map(c => (
                <TrashCard key={c.id} icon={Brain} title={c.name} subtitle={c.email}
                  meta={(c.title || 'Psychologist') + ' · Deleted ' + new Date(c.deletedAt).toLocaleDateString()}
                  deletedAt={c.deletedAt} onRestore={() => handleRestoreCounsellor(c.id)}
                  onPermanent={() => handlePermanentDeleteCounsellor(c.id)}
                  isRestoring={actionState[c.id]?.restoring} isDeleting={actionState[c.id]?.deleting} />
              ))}
            </div>
          ))}

          {activeTab === 'users' && (filteredUsers.length === 0 ? <EmptyTrash label="students" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {filteredUsers.map(u => (
                <TrashCard key={u.id} icon={User} title={u.name} subtitle={u.email}
                  meta={(u.schoolName ? u.schoolName + ' · ' : '') + 'Deleted ' + new Date(u.deletedAt).toLocaleDateString()}
                  deletedAt={u.deletedAt} onRestore={() => handleRestoreUser(u.id)}
                  onPermanent={() => handlePermanentDeleteUser(u.id)}
                  isRestoring={actionState[u.id]?.restoring} isDeleting={actionState[u.id]?.deleting} />
              ))}
            </div>
          ))}

          {activeTab === 'appointments' && (filteredAppointments.length === 0 ? <EmptyTrash label="bookings" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {filteredAppointments.map(a => (
                <TrashCard key={a.id} icon={Calendar}
                  title={a.mode + ' Session'}
                  subtitle={'Date: ' + a.date + ' at ' + a.time}
                  meta={'Status: ' + a.status + ' · Deleted ' + new Date(a.deletedAt).toLocaleDateString()}
                  deletedAt={a.deletedAt}
                  onRestore={() => handleRestoreAppointment(a.id)}
                  onPermanent={async () => {
                    if (!await showConfirm('Permanently delete this booking? This cannot be undone.')) return;
                    setAction(a.id, 'deleting', true);
                    try {
                      await ApiService.permanentDeleteAppointment(a.id);
                      await showAlert('Booking permanently deleted.');
                      loadTrash(); if (reloadData) reloadData();
                    } catch (err) { await showAlert(err.message || 'Failed.'); }
                    setAction(a.id, 'deleting', false);
                  }}
                  isRestoring={actionState[a.id]?.restoring} isDeleting={actionState[a.id]?.deleting} />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
