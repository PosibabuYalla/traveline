import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../services/adminApi';
import loginBg from '../../assets/images/Login_Img.png';
import logoImg from '../../assets/icons/logo.png';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await adminService.login(email, password);
      localStorage.setItem('adminToken', res.data.data.accessToken);
      navigate('/admin/drivers');
    } catch {
      setError('Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)' }} />

      <nav style={{ position: 'relative', zIndex: 10, padding: '18px 32px' }}>
        {logoImg
          ? <img src={logoImg} alt="TravelLine" style={{ height: '36px' }} />
          : <span style={{ fontWeight: 800, fontSize: '20px', color: '#fff' }}>Travel<span style={{ color: '#D89400' }}>Line</span></span>
        }
      </nav>

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(40px) saturate(130%)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: '28px', padding: '40px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>

          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#F5C842,#C8900A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(200,144,10,0.35)' }}>
              <Shield style={{ width: '26px', height: '26px', color: '#fff' }} />
            </div>
          </div>

          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '22px', color: '#101828', textAlign: 'center', margin: '0 0 4px' }}>Admin Portal</h1>
          <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', margin: '0 0 24px' }}>TravelLine Driver Management</p>

          {error && (
            <div style={{ background: 'rgba(254,226,226,0.80)', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#C8900A' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@travelline.com"
                  style={{ width: '100%', height: '40px', borderRadius: '10px', paddingLeft: '32px', paddingRight: '12px', fontSize: '13px', background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(0,0,0,0.10)', color: '#17213D', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#C8900A' }} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ width: '100%', height: '40px', borderRadius: '10px', paddingLeft: '32px', paddingRight: '40px', fontSize: '13px', background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(0,0,0,0.10)', color: '#17213D', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                  {showPw ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '4px', height: '42px', borderRadius: '11px', background: 'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1, fontFamily: "'Poppins',sans-serif", boxShadow: '0 6px 20px rgba(200,144,10,0.35)' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
      <style>{`html,body{overflow:hidden;height:100%;margin:0}*,*::before,*::after{box-sizing:border-box}`}</style>
    </div>
  );
};
