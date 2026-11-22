import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, Clock } from 'lucide-react';
import { useRegistrationStore } from '../../store/registrationStore';
import { Step1PersonalDetails } from './Step1PersonalDetails';
import { Step2DrivingDetails } from './Step2DrivingDetails';
import { Step3DocumentsVehicle } from './Step3DocumentsVehicle';
import loginBg from '../../assets/images/Login_Img.png';
import logoImg from '../../assets/icons/logo.png';

const STEPS = [
  { label: 'Personal Details' },
  { label: 'Driving Details' },
  { label: 'Documents & Vehicle' },
];

const TravelLineLogo = () => (
  logoImg
    ? <img src={logoImg} alt="TravelLine" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
    : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="38" height="24" viewBox="0 0 56 34" fill="none">
          <path d="M20 14 L23 8 L33 8 L36 14" stroke="#C8900A" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
          <path d="M6 23 L12 13 L44 13 L50 23" stroke="#C8900A" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
          <rect x="3" y="21" width="50" height="10" rx="5" fill="#C8900A" />
          <circle cx="13" cy="31" r="4" fill="#fff" stroke="#C8900A" strokeWidth="1.8" />
          <circle cx="43" cy="31" r="4" fill="#fff" stroke="#C8900A" strokeWidth="1.8" />
        </svg>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.1, fontFamily: "'Poppins',sans-serif" }}>
            <span style={{ color: '#1a1a2e' }}>Travel</span><span style={{ color: '#C8900A' }}>Line</span>
          </div>
          <div style={{ fontSize: '8px', letterSpacing: '0.2em', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>
            Travel Agency
          </div>
        </div>
      </div>
    )
);

const FEATURES = [
  { icon: Zap, title: 'Quick Onboarding', sub: 'Register in minutes' },
  { icon: ShieldCheck, title: 'Verified Platform', sub: 'Trusted & secure' },
  { icon: Clock, title: 'Flexible Hours', sub: 'Work on your schedule' },
];

export const RegistrationWizard = () => {
  const { currentStep } = useRegistrationStore();

  return (
    <div className="reg-root">
      {/* Background */}
      <div className="reg-bg" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="reg-overlay" />

      {/* ── SIDEBAR ── */}
      <aside className="reg-sidebar">
        <div className="reg-sidebar-inner">
          {/* Logo */}
          <div style={{ marginBottom: '28px' }}>
            <TravelLineLogo />
          </div>

          {/* Tagline */}
          <h2 className="reg-tagline">
            Become a<br />
            <span style={{ color: '#C8900A' }}>Driver Partner</span>
          </h2>
          <div style={{ width: '36px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg,#C8900A,#F5C842)', margin: '12px 0 14px' }} />
          <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: 1.65, marginBottom: '32px' }}>
            Join our trusted travel network<br />and start earning today.
          </p>

          {/* Vertical step list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => {
              const n = i + 1;
              const done = n < currentStep;
              const active = n === currentStep;
              const last = i === STEPS.length - 1;
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  {/* Circle + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, transition: 'all 0.3s',
                      background: done || active ? 'linear-gradient(135deg,#F5C842,#C8900A)' : 'rgba(255,255,255,0.55)',
                      color: done || active ? '#fff' : '#9ca3af',
                      border: done || active ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
                      boxShadow: active ? '0 0 0 5px rgba(200,144,10,0.18), 0 3px 12px rgba(200,144,10,0.35)' : done ? '0 2px 10px rgba(200,144,10,0.30)' : 'none',
                    }}>
                      {done ? '✓' : n}
                    </div>
                    {!last && (
                      <div style={{
                        width: '2px', height: '36px', borderRadius: '2px', margin: '4px 0',
                        background: done ? 'linear-gradient(180deg,#C8900A,#F5C842)' : 'rgba(0,0,0,0.10)',
                        transition: 'background 0.4s',
                      }} />
                    )}
                  </div>
                  {/* Label */}
                  <div style={{ paddingTop: '6px', paddingBottom: last ? 0 : '32px' }}>
                    <div style={{
                      fontSize: '13px', fontWeight: active ? 700 : 500,
                      color: active ? '#1a1a2e' : done ? '#C8900A' : '#9ca3af',
                      transition: 'color 0.3s',
                    }}>
                      {step.label}
                    </div>
                    {active && (
                      <div style={{ fontSize: '11px', color: '#C8900A', marginTop: '2px', fontWeight: 500 }}>In progress</div>
                    )}
                    {done && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Completed</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Features at bottom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            {FEATURES.map(({ icon: Icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,243,195,0.75)', border: '1px solid rgba(200,144,10,0.20)',
                }}>
                  <Icon style={{ width: '17px', height: '17px', color: '#C8900A' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1a2e' }}>{title}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── RIGHT CONTENT ── */}
      <main className="reg-main">
        {/* Top bar */}
        <div className="reg-topbar">
          {/* Mobile logo */}
          <div className="reg-mobile-logo">
            <TravelLineLogo />
          </div>
          <h1 className="reg-title">Driver Registration</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <span className="reg-login-text">Already have an account?</span>
            <Link to="/login" className="reg-login-btn">Login</Link>
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="reg-form-area">
          <div className="reg-form-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {currentStep === 1 && <Step1PersonalDetails />}
                {currentStep === 2 && <Step2DrivingDetails />}
                {currentStep === 3 && <Step3DocumentsVehicle />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        html, body { overflow: hidden; height: 100%; margin: 0; }
        *, *::before, *::after { box-sizing: border-box; }

        .reg-root {
          position: fixed; inset: 0;
          display: flex; font-family: 'Inter',sans-serif;
          overflow: hidden;
        }
        .reg-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          background-repeat: no-repeat;
        }
        .reg-overlay {
          position: absolute; inset: 0;
          background: rgba(240,245,255,0.12); pointer-events: none;
        }

        /* SIDEBAR */
        .reg-sidebar {
          position: relative; z-index: 10;
          flex-shrink: 0; display: none;
          flex-direction: column; height: 100%;
          width: 260px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(32px) saturate(140%);
          -webkit-backdrop-filter: blur(32px) saturate(140%);
          border-right: 1.5px solid rgba(255,255,255,0.90);
          box-shadow: 4px 0 32px rgba(0,0,0,0.08);
        }
        .reg-sidebar-inner {
          display: flex; flex-direction: column; height: 100%;
          padding: 28px 24px 24px;
          overflow-y: auto; overflow-x: hidden;
          scrollbar-width: none;
        }
        .reg-sidebar-inner::-webkit-scrollbar { display: none; }
        .reg-tagline {
          font-size: 20px; font-weight: 800; line-height: 1.25;
          color: #1a1a2e; margin: 0; font-family: 'Poppins',sans-serif;
        }

        /* MAIN */
        .reg-main {
          position: relative; z-index: 10;
          flex: 1; display: flex; flex-direction: column;
          height: 100%; overflow: hidden; min-width: 0;
        }

        /* TOP BAR */
        .reg-topbar {
          flex-shrink: 0; display: flex; align-items: center;
          padding: 14px 20px 10px; gap: 12px;
        }
        .reg-mobile-logo { display: flex; align-items: center; }
        .reg-title {
          display: none; margin: 0;
          font-family: 'Poppins',sans-serif; font-weight: 700;
          font-size: 22px; color: #1a1a2e; white-space: nowrap;
        }
        .reg-login-text { display: none; font-size: 13px; color: #4a5568; white-space: nowrap; }
        .reg-login-btn {
          font-size: 13px; font-weight: 700; padding: 8px 20px;
          border-radius: 999px; text-decoration: none; display: inline-block; white-space: nowrap;
          background: linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%);
          color: #fff; box-shadow: 0 4px 14px rgba(200,144,10,0.40);
          transition: filter 0.15s;
        }
        .reg-login-btn:hover { filter: brightness(1.08); }

        /* FORM AREA */
        .reg-form-area {
          flex: 1; overflow-y: auto; padding: 0 16px 16px;
          scrollbar-width: thin; scrollbar-color: rgba(200,144,10,0.30) transparent;
          min-height: 0;
        }
        .reg-form-area::-webkit-scrollbar { width: 4px; }
        .reg-form-area::-webkit-scrollbar-track { background: transparent; }
        .reg-form-area::-webkit-scrollbar-thumb { background: rgba(200,144,10,0.30); border-radius: 4px; }

        .reg-form-card {
          border-radius: 24px;
          background: rgba(255,255,255,0.74);
          backdrop-filter: blur(36px) saturate(130%);
          -webkit-backdrop-filter: blur(36px) saturate(130%);
          border: 1.5px solid rgba(255,255,255,0.95);
          box-shadow: 0 12px 48px rgba(0,0,0,0.11), inset 0 1px 0 #fff;
          padding: 20px;
        }

        /* TABLET */
        @media (min-width: 640px) {
          .reg-topbar { padding: 14px 28px 10px; }
          .reg-form-area { padding: 0 20px 14px; }
          .reg-form-card { padding: 18px 24px; border-radius: 28px; }
          .reg-login-text { display: block; }
          .reg-title { display: block; }
          .reg-mobile-logo { display: none; }
        }

        /* DESKTOP */
        @media (min-width: 1024px) {
          .reg-sidebar { display: flex; }
          .reg-topbar { padding: 14px 32px 10px; }
          .reg-form-area { padding: 0 24px 12px; }
          .reg-form-card { padding: 16px 24px; }
          .reg-title { font-size: 24px; }
        }

        /* LARGE */
        @media (min-width: 1280px) {
          .reg-sidebar { width: 280px; }
          .reg-topbar { padding: 16px 36px 12px; }
          .reg-form-area { padding: 0 28px 14px; }
          .reg-form-card { padding: 18px 28px; }
        }

        /* ULTRA — extra breathing room on very wide screens */
        @media (min-width: 1536px) {
          .reg-topbar { padding: 18px 44px 14px; }
          .reg-form-area { padding: 0 36px 16px; }
          .reg-form-card { padding: 20px 32px; }
        }

        /* COMPACT HEIGHT — extra squeeze for 768px-height laptops */
        @media (max-height: 800px) and (min-width: 1024px) {
          .reg-topbar { padding: 10px 28px 8px; }
          .reg-form-area { padding: 0 20px 8px; }
          .reg-form-card { padding: 12px 20px; }
        }
      `}</style>
    </div>
  );
};
