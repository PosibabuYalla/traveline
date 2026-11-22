import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, CheckCircle, Clock, XCircle, AlertCircle, LogOut, Shield, ChevronRight, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminApi';

interface Driver {
  id: string; fullName: string; mobileNumber: string; registrationId: string;
  verificationStatus: string; registrationType: string; profilePhotoUrl?: string;
  createdAt: string; documents: { id: string }[]; address?: { state: string };
}
interface Stats { total: number; submitted: number; underReview: number; approved: number; rejected: number; }

const STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  SUBMITTED:               { bg: 'rgba(255,243,195,0.80)', color: '#92680A',  label: 'Submitted' },
  UNDER_REVIEW:            { bg: 'rgba(219,234,254,0.80)', color: '#1d4ed8',  label: 'Under Review' },
  APPROVED:                { bg: 'rgba(220,252,231,0.80)', color: '#15803d',  label: 'Approved' },
  REJECTED:                { bg: 'rgba(254,226,226,0.80)', color: '#dc2626',  label: 'Rejected' },
  RESUBMISSION_REQUIRED:   { bg: 'rgba(255,237,213,0.80)', color: '#c2410c',  label: 'Resubmit' },
};

export const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [drRes, stRes] = await Promise.all([
        adminService.getDrivers({ status: statusFilter || undefined, search: search || undefined, page }),
        adminService.getStats(),
      ]);
      setDrivers(drRes.data.data.drivers);
      setTotalPages(drRes.data.data.pages);
      setStats(stRes.data.data);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, [statusFilter, search, page]);

  useEffect(() => { load(); }, [load]);

  const logout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login'); };

  const statCards = stats ? [
    { label: 'Total', value: stats.total,       icon: <Users style={{ width: '18px', height: '18px' }} />,        color: '#6366f1' },
    { label: 'Pending',  value: stats.submitted, icon: <Clock style={{ width: '18px', height: '18px' }} />,        color: '#C8900A' },
    { label: 'Review',   value: stats.underReview, icon: <AlertCircle style={{ width: '18px', height: '18px' }} />, color: '#1d4ed8' },
    { label: 'Approved', value: stats.approved,  icon: <CheckCircle style={{ width: '18px', height: '18px' }} />,  color: '#15803d' },
    { label: 'Rejected', value: stats.rejected,  icon: <XCircle style={{ width: '18px', height: '18px' }} />,      color: '#dc2626' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter',sans-serif" }}>
      {/* Top nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#F5C842,#C8900A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield style={{ width: '16px', height: '16px', color: '#fff' }} />
          </div>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '16px', color: '#101828' }}>TravelLine <span style={{ color: '#C8900A' }}>Admin</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: '#fee2e2', border: 'none', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut style={{ width: '13px', height: '13px' }} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', marginBottom: '24px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#101828', fontFamily: "'Poppins',sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94a3b8' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, mobile, ID…"
              style={{ width: '100%', height: '36px', borderRadius: '8px', paddingLeft: '32px', paddingRight: '12px', fontSize: '13px', border: '1px solid #e2e8f0', outline: 'none', color: '#17213D', boxSizing: 'border-box' }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ height: '36px', borderRadius: '8px', padding: '0 12px', fontSize: '13px', border: '1px solid #e2e8f0', outline: 'none', color: '#17213D', background: '#fff' }}>
            <option value="">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RESUBMISSION_REQUIRED">Resubmit</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#101828' }}>Driver Applications</span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>{drivers.length} shown</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : drivers.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>No drivers found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Driver', 'Registration ID', 'Mobile', 'State', 'Documents', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d, i) => {
                  const st = STATUS_COLOR[d.verificationStatus] || STATUS_COLOR.SUBMITTED;
                  return (
                    <tr key={d.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer', transition: 'background 0.1s' }}
                      onClick={() => navigate(`/admin/drivers/${d.id}`)}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#F5C842,#C8900A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                            {d.profilePhotoUrl
                              ? <img src={d.profilePhotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              : d.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#101828' }}>{d.fullName}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{d.registrationType === 'DRIVER_WITH_VEHICLE' ? 'With Vehicle' : 'Driver Only'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{d.registrationId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{d.mobileNumber}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>{d.address?.state || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: d.documents.length >= 4 ? '#15803d' : '#C8900A' }}>{d.documents.length} docs</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <ChevronRight style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: p === page ? 'none' : '1px solid #e2e8f0', background: p === page ? '#C8900A' : '#fff', color: p === page ? '#fff' : '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
