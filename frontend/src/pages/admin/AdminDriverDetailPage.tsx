import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Car, FileText, Phone, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { adminService } from '../../services/adminApi';

interface Doc { id: string; documentType: string; fileUrl: string; fileName: string; verificationStatus: string; }
interface DriverDetail {
  id: string; fullName: string; mobileNumber: string; alternateMobile?: string;
  registrationId: string; verificationStatus: string; registrationType: string;
  profilePhotoUrl?: string; dateOfBirth?: string; gender?: string;
  user?: { email: string; createdAt: string };
  address?: { doorNumber: string; street: string; village: string; district: string; state: string; pinCode: string };
  drivingLicence?: { licenceNumber: string; licenceClass: string; issuingAuthority: string; issueDate: string; expiryDate: string; stateOfIssue: string };
  drivingExperience?: { totalYears: number; previousCompany?: string; languages: string[]; willingLongDistance: boolean };
  emergencyContact?: { contactName: string; contactNumber: string; relationship: string };
  documents: Doc[];
}

const DOC_LABELS: Record<string, string> = {
  AADHAAR_CARD: 'Aadhaar Card', DRIVING_LICENCE_FRONT: 'DL Front', DRIVING_LICENCE_BACK: 'DL Back',
  PROFILE_PHOTO: 'Profile Photo', ADDRESS_PROOF: 'Address Proof', PAN_CARD: 'PAN Card',
};

const SH = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
    <span style={{ color: '#C8900A' }}>{icon}</span>
    <span style={{ fontWeight: 700, fontSize: '15px', color: '#101828' }}>{title}</span>
  </div>
);
const Row = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{label}</div>
    <div style={{ fontSize: '13.5px', color: '#17213D', fontWeight: 500 }}>{value || '—'}</div>
  </div>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>{children}</div>
);

export const AdminDriverDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    adminService.getDriver(id).then(r => setDriver(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string, reason?: string) => {
    if (!id) return;
    setActionLoading(true); setMsg('');
    try {
      await adminService.updateStatus(id, status, reason);
      const r = await adminService.getDriver(id);
      setDriver(r.data.data);
      setMsg(status === 'APPROVED' ? '✓ Driver approved successfully!' : status === 'UNDER_REVIEW' ? '✓ Marked as Under Review' : '✓ Status updated');
      setShowReject(false); setRejectReason('');
    } catch { setMsg('Failed to update status'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: "'Inter',sans-serif", color: '#94a3b8' }}>Loading…</div>;
  if (!driver) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: "'Inter',sans-serif", color: '#dc2626' }}>Driver not found</div>;

  const st = driver.verificationStatus;
  const stColor = st === 'APPROVED' ? '#15803d' : st === 'REJECTED' ? '#dc2626' : st === 'UNDER_REVIEW' ? '#1d4ed8' : '#C8900A';
  const stBg   = st === 'APPROVED' ? 'rgba(220,252,231,0.80)' : st === 'REJECTED' ? 'rgba(254,226,226,0.80)' : st === 'UNDER_REVIEW' ? 'rgba(219,234,254,0.80)' : 'rgba(255,243,195,0.80)';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter',sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', gap: '14px', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/admin/drivers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>|</span>
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#101828' }}>{driver.fullName}</span>
        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: stBg, color: stColor }}>{st.replace(/_/g, ' ')}</span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Action bar */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '2px' }}>CURRENT STATUS</div>
              <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: stBg, color: stColor }}>{st.replace(/_/g, ' ')}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {st !== 'UNDER_REVIEW' && (
                <button disabled={actionLoading} onClick={() => updateStatus('UNDER_REVIEW')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'rgba(219,234,254,0.80)', border: '1px solid #93c5fd', color: '#1d4ed8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <AlertCircle style={{ width: '13px', height: '13px' }} /> Mark Under Review
                </button>
              )}
              {st !== 'APPROVED' && (
                <button disabled={actionLoading} onClick={() => updateStatus('APPROVED')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'linear-gradient(135deg,#4ade80,#16a34a)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.30)' }}>
                  <CheckCircle style={{ width: '13px', height: '13px' }} /> Approve
                </button>
              )}
              {st !== 'REJECTED' && (
                <button disabled={actionLoading} onClick={() => setShowReject(r => !r)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'rgba(254,226,226,0.80)', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <XCircle style={{ width: '13px', height: '13px' }} /> Reject
                </button>
              )}
            </div>
          </div>

          {showReject && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Rejection Reason</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Tell the driver why their application was rejected…"
                style={{ width: '100%', borderRadius: '9px', padding: '10px 12px', fontSize: '13px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#17213D' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button disabled={actionLoading || !rejectReason.trim()} onClick={() => updateStatus('REJECTED', rejectReason)}
                  style={{ padding: '8px 18px', borderRadius: '9px', background: '#dc2626', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}>
                  Confirm Reject
                </button>
                <button onClick={() => updateStatus('RESUBMISSION_REQUIRED', rejectReason)} disabled={actionLoading || !rejectReason.trim()}
                  style={{ padding: '8px 18px', borderRadius: '9px', background: '#fff', border: '1px solid #e2e8f0', color: '#c2410c', fontSize: '13px', fontWeight: 600, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}>
                  Ask to Resubmit
                </button>
              </div>
            </div>
          )}

          {msg && <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: msg.startsWith('✓') ? '#15803d' : '#dc2626' }}>{msg}</div>}
        </Card>

        {/* Profile */}
        <Card>
          <SH icon={<User style={{ width: '16px', height: '16px' }} />} title="Personal Details" />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#F5C842,#C8900A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {driver.profilePhotoUrl ? <img src={driver.profilePhotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : driver.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', flex: 1 }}>
              <Row label="Full Name" value={driver.fullName} />
              <Row label="Email" value={driver.user?.email} />
              <Row label="Mobile" value={driver.mobileNumber} />
              <Row label="Alt Mobile" value={driver.alternateMobile} />
              <Row label="Date of Birth" value={driver.dateOfBirth ? new Date(driver.dateOfBirth).toLocaleDateString('en-IN') : undefined} />
              <Row label="Gender" value={driver.gender} />
              <Row label="Reg. ID" value={driver.registrationId} />
              <Row label="Type" value={driver.registrationType?.replace(/_/g, ' ')} />
              <Row label="Registered" value={driver.user?.createdAt ? new Date(driver.user.createdAt).toLocaleDateString('en-IN') : undefined} />
            </div>
          </div>
        </Card>

        {/* Address */}
        {driver.address && (
          <Card>
            <SH icon={<MapPin style={{ width: '16px', height: '16px' }} />} title="Address" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              <Row label="Door No" value={driver.address.doorNumber} />
              <Row label="Street" value={driver.address.street} />
              <Row label="Village/City" value={driver.address.village} />
              <Row label="District" value={driver.address.district} />
              <Row label="State" value={driver.address.state} />
              <Row label="PIN Code" value={driver.address.pinCode} />
            </div>
          </Card>
        )}

        {/* Driving Licence */}
        {driver.drivingLicence && (
          <Card>
            <SH icon={<Car style={{ width: '16px', height: '16px' }} />} title="Driving Licence" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              <Row label="Licence No" value={driver.drivingLicence.licenceNumber} />
              <Row label="Class" value={driver.drivingLicence.licenceClass} />
              <Row label="Issuing Authority" value={driver.drivingLicence.issuingAuthority} />
              <Row label="Issue Date" value={new Date(driver.drivingLicence.issueDate).toLocaleDateString('en-IN')} />
              <Row label="Expiry Date" value={new Date(driver.drivingLicence.expiryDate).toLocaleDateString('en-IN')} />
              <Row label="State of Issue" value={driver.drivingLicence.stateOfIssue} />
            </div>
          </Card>
        )}

        {/* Experience */}
        {driver.drivingExperience && (
          <Card>
            <SH icon={<Car style={{ width: '16px', height: '16px' }} />} title="Experience" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              <Row label="Total Years" value={String(driver.drivingExperience.totalYears)} />
              <Row label="Previous Company" value={driver.drivingExperience.previousCompany} />
              <Row label="Languages" value={driver.drivingExperience.languages?.join(', ')} />
              <Row label="Long Distance" value={driver.drivingExperience.willingLongDistance ? 'Yes' : 'No'} />
            </div>
          </Card>
        )}

        {/* Emergency Contact */}
        {driver.emergencyContact && (
          <Card>
            <SH icon={<Phone style={{ width: '16px', height: '16px' }} />} title="Emergency Contact" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              <Row label="Name" value={driver.emergencyContact.contactName} />
              <Row label="Number" value={driver.emergencyContact.contactNumber} />
              <Row label="Relationship" value={driver.emergencyContact.relationship} />
            </div>
          </Card>
        )}

        {/* Documents */}
        <Card>
          <SH icon={<FileText style={{ width: '16px', height: '16px' }} />} title={`Documents (${driver.documents.length})`} />
          {driver.documents.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No documents uploaded</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
              {driver.documents.map(doc => (
                <div key={doc.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#101828' }}>{DOC_LABELS[doc.documentType] || doc.documentType}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{doc.fileName}</div>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', background: 'rgba(255,243,195,0.80)', border: '1px solid rgba(200,144,10,0.25)', color: '#C8900A', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                    <Eye style={{ width: '12px', height: '12px' }} /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
