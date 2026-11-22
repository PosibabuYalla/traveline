import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import loginBg from '../assets/images/Login_Img.png';
import logoImg from '../assets/icons/logo.png';

export const NotFoundPage = () => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.45)' }} />

    <nav style={{ position: 'relative', zIndex: 10, padding: '18px 32px' }}>
      <img src={logoImg} alt="TravelLine" style={{ height: '36px' }} />
    </nav>

    <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(40px) saturate(130%)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: '28px', padding: '48px 36px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>

        {/* 404 number */}
        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: '80px', lineHeight: 1, background: 'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          404
        </div>

        <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '22px', color: '#101828', margin: '0 0 10px' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: '0 0 32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => window.history.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', borderRadius: '11px', background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.12)', color: '#64748B', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Go Back
          </button>
          <Link to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', borderRadius: '11px', background: 'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)', color: '#fff', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(200,144,10,0.35)', fontFamily: "'Poppins',sans-serif" }}>
            <Home style={{ width: '14px', height: '14px' }} /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
    <style>{`html,body{overflow:hidden;height:100%;margin:0}*,*::before,*::after{box-sizing:border-box}`}</style>
  </div>
);
