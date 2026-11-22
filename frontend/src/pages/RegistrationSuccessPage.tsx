import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import loginBg from '../assets/images/Login_Img.png';
import logoImg from '../assets/icons/logo.png';

const TravelLineLogo = () => (
  logoImg
    ? <img src={logoImg} alt="TravelLine" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
    : (
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '20px' }}>
        <span style={{ color: '#fff' }}>Travel</span><span style={{ color: '#D89400' }}>Line</span>
      </div>
    )
);

export const RegistrationSuccessPage = () => {
  const { state } = useLocation();
  const registrationId = (state as { registrationId?: string })?.registrationId
    || 'DRV' + Date.now().toString().slice(-8);

  return (
    <div className="rs-root">
      {/* Background */}
      <div className="rs-bg" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="rs-overlay" />

      {/* Nav */}
      <nav className="rs-nav">
        <TravelLineLogo />
      </nav>

      {/* Center card */}
      <div className="rs-center">
        <div className="rs-card">

          {/* Green verified tick */}
          <div className="rs-tick-wrap">
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className="rs-tick-svg">
              <circle cx="40" cy="40" r="38" fill="url(#greenGrad)" />
              <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              <path d="M22 40 L34 52 L58 28" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <radialGradient id="greenGrad" cx="40%" cy="30%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="55%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#14532d" />
                </radialGradient>
              </defs>
            </svg>
            {/* Pulse ring */}
            <div className="rs-pulse" />
          </div>

          {/* Title */}
          <h1 className="rs-title">Registration Submitted!</h1>
          <p className="rs-sub">Your details are under review. We'll notify you once verified.</p>

          {/* ID chip */}
          <div className="rs-id-chip">
            <span className="rs-id-label">Registration ID</span>
            <span className="rs-id-val">{registrationId}</span>
          </div>

          {/* Status badge */}
          <div className="rs-status">
            <span className="rs-status-dot" />
            Under Review
          </div>

          {/* CTA */}
          <Link to="/dashboard" className="rs-btn">
            <LogIn style={{ width: '16px', height: '16px' }} />
            Go to Dashboard
          </Link>
        </div>
      </div>

      <style>{`
        html, body { overflow: hidden; height: 100%; margin: 0; }
        *, *::before, *::after { box-sizing: border-box; }

        .rs-root {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          font-family: 'Inter', sans-serif;
        }
        .rs-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
        }
        .rs-overlay {
          position: absolute; inset: 0;
          background: rgba(10,20,40,0.38);
          pointer-events: none;
        }

        /* Nav */
        .rs-nav {
          position: relative; z-index: 10;
          padding: 18px 32px; flex-shrink: 0;
        }

        /* Center */
        .rs-center {
          position: relative; z-index: 10;
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 0 20px 20px;
        }

        /* Card */
        .rs-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.80);
          backdrop-filter: blur(40px) saturate(130%);
          -webkit-backdrop-filter: blur(40px) saturate(130%);
          border: 1.5px solid rgba(255,255,255,0.95);
          border-radius: 28px;
          padding: 44px 36px 36px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18), inset 0 1px 0 #fff;
        }

        /* Tick */
        .rs-tick-wrap {
          position: relative;
          display: inline-flex;
          align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .rs-tick-svg {
          position: relative; z-index: 2;
          filter: drop-shadow(0 6px 20px rgba(22,163,74,0.50));
          animation: rs-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .rs-pulse {
          position: absolute;
          width: 96px; height: 96px;
          border-radius: 50%;
          border: 2px solid rgba(22,163,74,0.35);
          animation: rs-pulse 1.8s ease-out infinite;
        }
        @keyframes rs-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes rs-pulse {
          0%   { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        /* Text */
        .rs-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 800; font-size: 22px;
          color: #101828; margin: 0 0 8px;
        }
        .rs-sub {
          font-size: 13.5px; color: #64748B;
          line-height: 1.6; margin: 0 0 22px;
        }

        /* ID chip */
        .rs-id-chip {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 8px 18px; border-radius: 999px;
          background: rgba(255,243,195,0.75);
          border: 1px solid rgba(200,144,10,0.30);
          margin-bottom: 14px;
        }
        .rs-id-label {
          font-size: 11px; font-weight: 600; color: #92680A;
        }
        .rs-id-val {
          font-size: 13px; font-weight: 700; color: '#C8900A';
          font-family: 'Poppins', sans-serif; color: #A96B00;
        }

        /* Status */
        .rs-status {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; border-radius: 999px;
          background: rgba(240,253,244,0.90);
          border: 1px solid #86efac;
          font-size: 12px; font-weight: 700; color: #16a34a;
          margin-bottom: 24px;
        }
        .rs-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e;
          animation: rs-blink 1.4s ease-in-out infinite;
        }
        @keyframes rs-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* Button */
        .rs-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 36px; border-radius: 12px;
          background: linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%);
          color: #fff; font-size: 14px; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(200,144,10,0.40);
          transition: filter 0.15s;
          font-family: 'Poppins', sans-serif;
        }
        .rs-btn:hover { filter: brightness(1.08); }

        @media (max-width: 480px) {
          .rs-card { padding: 36px 22px 28px; border-radius: 20px; }
          .rs-title { font-size: 19px; }
        }
      `}</style>
    </div>
  );
};
