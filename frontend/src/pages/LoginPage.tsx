import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Headphones, UserPlus, ChevronRight, Calendar, Users, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import loginBg from '../assets/images/Login_Img.png';
import logoImg from '../assets/icons/logo.png';

const schema = z.object({
  email: z.string().min(1, 'Email or mobile number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const TravelLineLogo = () => (
  logoImg
    ? <img src={logoImg} alt="TravelLine" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
    : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="40" height="26" viewBox="0 0 56 34" fill="none">
          <path d="M20 14 L23 8 L33 8 L36 14" stroke="#C8900A" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
          <path d="M6 23 L12 13 L44 13 L50 23" stroke="#C8900A" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
          <rect x="3" y="21" width="50" height="10" rx="5" fill="#C8900A" />
          <circle cx="13" cy="31" r="4" fill="#fff" stroke="#C8900A" strokeWidth="1.8" />
          <circle cx="43" cy="31" r="4" fill="#fff" stroke="#C8900A" strokeWidth="1.8" />
        </svg>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.1, fontFamily: "'Poppins',sans-serif" }}>
            <span style={{ color: '#1a1a2e' }}>Travel</span><span style={{ color: '#C8900A' }}>Line</span>
          </div>
          <div style={{ fontSize: '8px', letterSpacing: '0.22em', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>
            Travel Agency
          </div>
        </div>
      </div>
    )
);


const DriverAvatarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
    <circle cx="28" cy="14" r="9" fill="#C8900A" />
    <path d="M10 44 C10 32 18 24 28 24 C38 24 46 32 46 44" stroke="#C8900A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="28" cy="43" r="10" stroke="#C8900A" strokeWidth="2.2" fill="none" />
    <circle cx="28" cy="43" r="3.2" fill="#C8900A" />
    <line x1="28" y1="33" x2="28" y2="39.8" stroke="#C8900A" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="43" x2="24.8" y2="43" stroke="#C8900A" strokeWidth="2" strokeLinecap="round" />
    <line x1="31.2" y1="43" x2="38" y2="43" stroke="#C8900A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setDriver, setAccessToken } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      const { accessToken, refreshToken, user, driver } = res.data.data;
      setAccessToken(accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      if (driver) setDriver(driver);
      toast.success('Welcome back!', 'You have been logged in successfully.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e?.response?.status === 429) return;
      const msg = e?.response?.data?.error || 'Login failed.';
      toast.error('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.boxShadow = '0 0 0 3px rgba(200,144,10,0.22)';
    e.target.style.borderColor = 'rgba(200,144,10,0.75)';
    e.target.style.background = 'rgba(255,255,255,0.95)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.04)';
    e.target.style.borderColor = 'rgba(0,0,0,0.10)';
    e.target.style.background = 'rgba(255,255,255,0.80)';
  };

  return (
    <div
      className="login-root"
      style={{
        position: 'fixed', inset: 0,
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter',sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,250,235,0.06)', pointerEvents: 'none' }} />

      {/* ── NAVBAR ── */}
      <nav className="login-nav">
        <TravelLineLogo />

        <button className="login-help-btn">
          <Headphones style={{ width: '15px', height: '15px', color: '#C8900A', flexShrink: 0 }} />
          <span className="login-help-text">Help &amp; Support</span>
        </button>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="login-content">

        {/* LEFT hero — desktop only */}
        <div className="login-hero">
          {/* Badge */}
          <div className="login-badge">
            <BadgeCheck style={{ width: '16px', height: '16px', color: '#C8900A', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2d2d2d', fontFamily: "'Poppins',sans-serif" }}>
              Verified Partner Network
            </span>
          </div>

          {/* Heading */}
          <h1 className="login-heading">
            <span style={{ color: '#1a1a2e' }}>Driver Partner </span>
            <span style={{ color: '#C8900A', fontStyle: 'italic' }}>Portal</span>
          </h1>

          {/* Gold underline */}
          <div style={{ width: '48px', height: '4px', borderRadius: '2px', background: 'linear-gradient(90deg,#C8900A,#F5C842)', marginBottom: '18px', alignSelf: 'center' }} />

          <p className="login-subtext">
            Join our trusted travel network and<br />be a part of memorable journeys.
          </p>

          {/* Feature cards */}
          <div className="login-cards">
            {[
              { icon: <Calendar style={{ width: '22px', height: '22px', color: '#C8900A' }} />, line1: 'Flexible', line2: 'Opportunities' },
              { icon: <Users style={{ width: '22px', height: '22px', color: '#C8900A' }} />, line1: 'Trusted', line2: 'Travel Agency' },
              { icon: <ShieldCheck style={{ width: '22px', height: '22px', color: '#C8900A' }} />, line1: 'Verified &', line2: 'Secure' },
            ].map(({ icon, line1, line2 }) => (
              <div key={line1} className="login-card-item">
                <div style={{ marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a2e', fontFamily: "'Poppins',sans-serif" }}>{line1}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{line2}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT form card */}
        <div className="login-form-wrap">
          {/* depth blob */}
          <div className="login-blob" />

          <div className="login-card">
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div className="login-avatar">
                <DriverAvatarIcon />
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(18px,2vw,22px)', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Poppins',sans-serif" }}>
                Welcome Back
              </h2>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>
                Login to your Driver Partner account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Email */}
              <div>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#C8900A', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Email or Mobile Number"
                    {...register('email')}
                    className="login-input"
                    onFocus={focus}
                    onBlur={blur}
                  />
                </div>
                {errors.email && <p style={{ color: '#C8900A', fontSize: '11.5px', marginTop: '3px', paddingLeft: '4px' }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#C8900A', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    {...register('password')}
                    className="login-input login-input-pw"
                    onFocus={focus}
                    onBlur={blur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}
                  >
                    {showPassword ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#C8900A', fontSize: '11.5px', marginTop: '3px', paddingLeft: '4px' }}>{errors.password.message}</p>}
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('rememberMe')} style={{ width: '15px', height: '15px', accentColor: '#C8900A', cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: '#3a3a4a' }}>Remember me</span>
                </label>
                <Link to="/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: '#C8900A', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
              >
                {loading ? 'Signing in…' : <><span>Login</span><ChevronRight style={{ width: '17px', height: '17px' }} /></>}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.11)' }} />
                <span style={{ fontSize: '12px', color: '#999' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.11)' }} />
              </div>

              {/* Register link */}
              <Link
                to="/register"
                className="login-register-btn"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,144,10,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <UserPlus style={{ width: '15px', height: '15px' }} />
                Create a New Driver Account
              </Link>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        html, body { overflow: hidden; height: 100%; margin: 0; }
        *, *::before, *::after { box-sizing: border-box; }
        input::placeholder { color: #bbb; }

        /* NAV */
        .login-nav {
          position: relative; z-index: 20; display: flex;
          align-items: center; justify-content: space-between;
          padding: 12px 24px; flex-shrink: 0;
        }
.login-help-btn {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600; padding: 8px 16px;
          border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.75); color: #2d2d2d; cursor: pointer;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.09); font-family: 'Poppins',sans-serif;
          white-space: nowrap;
        }
        .login-help-text { display: none; }

        /* CONTENT */
        .login-content {
          position: relative; z-index: 10; flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 12px 20px; min-height: 0;
        }

        /* HERO — hidden on mobile/tablet */
        .login-hero { display: none; }

        /* FORM WRAPPER */
        .login-form-wrap {
          position: relative; width: 100%; max-width: 390px;
        }
        .login-blob {
          position: absolute; inset: -14px; border-radius: 40px;
          background: rgba(255,255,255,0.28);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          z-index: 0;
        }
        .login-card {
          position: relative; z-index: 1; border-radius: 24px;
          padding: 22px 24px;
          background: rgba(255,255,255,0.74);
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          border: 1.5px solid rgba(255,255,255,0.98);
          box-shadow: 0 16px 50px rgba(0,0,0,0.13), inset 0 1px 0 #fff;
        }
        .login-avatar {
          width: 64px; height: 64px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg,#FFF6D0,#FFE08A);
          box-shadow: 0 4px 18px rgba(200,144,10,0.20);
          border: 1.5px solid rgba(200,144,10,0.16);
        }
        .login-input {
          width: 100%; padding: 11px 13px 11px 40px;
          border-radius: 10px; font-size: 13.5px; outline: none;
          background: rgba(255,255,255,0.80);
          border: 1.5px solid rgba(0,0,0,0.10); color: #2d2d2d;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
          transition: all 0.18s;
        }
        .login-input-pw { padding-right: 44px; }
        .login-btn {
          width: 100%; padding: 13px; border-radius: 10px;
          font-weight: 700; font-size: 14.5px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(135deg,#E5A812 0%,#C8900A 60%,#A97000 100%);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 5px 20px rgba(200,144,10,0.38);
          font-family: 'Poppins',sans-serif; transition: filter 0.15s;
        }
        .login-btn:disabled { opacity: 0.72; cursor: not-allowed; }
        .login-btn:not(:disabled):hover { filter: brightness(1.08); }
        .login-register-btn {
          width: 100%; padding: 12px; border-radius: 10px;
          font-size: 13.5px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border: 1.5px solid #C8900A; color: #C8900A;
          background: transparent; text-decoration: none;
          font-family: 'Poppins',sans-serif; transition: background 0.15s;
        }

        /* VERY SMALL MOBILE */
        @media (max-width: 400px) {
          .login-nav { padding: 10px 16px; }
          .login-content { padding: 8px 12px; }
          .login-card { padding: 18px 16px; border-radius: 18px; }
          .login-blob { inset: -10px; border-radius: 28px; }
        }

        /* TABLET (md) */
        @media (min-width: 640px) {
          .login-nav { padding: 14px 40px; }
          .login-help-text { display: inline; }
          .login-form-wrap { max-width: 420px; }
          .login-card { padding: 26px 30px; border-radius: 28px; }
          .login-blob { inset: -16px; border-radius: 44px; }
        }

        /* DESKTOP (lg) */
        @media (min-width: 1024px) {
          .login-nav { padding: 14px 56px; }
.login-content { justify-content: space-evenly; padding: 0 40px; }
          .login-hero {
            display: flex; flex-direction: column; align-items: center;
            flex-shrink: 0; width: 400px;
            padding-top: 24px; align-self: flex-start; text-align: center;
          }
          .login-badge {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 16px; border-radius: 999px; margin-bottom: 18px; width: fit-content;
            background: rgba(255,255,255,0.82);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1.5px solid rgba(200,144,10,0.38);
            box-shadow: 0 2px 10px rgba(0,0,0,0.07);
          }
          .login-heading {
            font-size: clamp(28px,3vw,40px); font-weight: 800;
            line-height: 1.15; margin: 0 0 12px;
            font-family: 'Poppins',sans-serif; white-space: nowrap;
          }
          .login-subtext {
            font-size: 15px; line-height: 1.65; color: #3a3a4a;
            margin: 0 0 28px; font-family: 'Poppins',sans-serif; text-align: center;
          }
          .login-cards {
            display: flex; gap: 12px; width: 100%;
          }
          .login-card-item {
            flex: 1; border-radius: 16px; padding: 16px 10px;
            display: flex; flex-direction: column; align-items: center; text-align: center;
            background: rgba(255,255,255,0.68);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1.5px solid rgba(255,255,255,0.95);
            box-shadow: 0 4px 18px rgba(0,0,0,0.07);
          }
          .login-form-wrap { max-width: 380px; align-self: flex-start; padding-top: 24px; }
          .login-card { padding: 24px 28px; }
        }

        /* LARGE (xl) */
        @media (min-width: 1280px) {
          .login-nav { padding: 16px 72px; }
          .login-content { padding: 0 60px; }
          .login-hero { width: 440px; }
          .login-heading { font-size: 40px; }
          .login-form-wrap { max-width: 400px; padding-top: 24px; }
        }
      `}</style>
    </div>
  );
};
