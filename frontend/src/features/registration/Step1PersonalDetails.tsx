import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Car, UserCheck, Camera, Check, ArrowRight, ArrowLeft, Calendar, Lock, Hash } from 'lucide-react';
import { useRegistrationStore } from '../../store/registrationStore';
import { useToast } from '../../components/ui/Toast';
import { authService, driverService, documentService } from '../../services/api';
import { uploadDocument } from '../../services/cloudinary';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  alternateMobile: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  doorNumber: z.string().min(1, 'Door/House number is required'),
  street: z.string().min(1, 'Street is required'),
  village: z.string().min(1, 'Village/City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  registrationType: z.enum(['DRIVER_ONLY', 'DRIVER_WITH_VEHICLE']),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh'];

const I: React.CSSProperties = {
  width: '100%', height: '34px', borderRadius: '9px', fontSize: '12.5px',
  paddingLeft: '30px', paddingRight: '10px',
  background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(0,0,0,0.10)',
  color: '#17213D', outline: 'none',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s',
};

const iFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = '#C8900A';
  e.target.style.boxShadow = '0 0 0 3px rgba(200,144,10,0.16)';
  e.target.style.background = 'rgba(255,255,255,0.97)';
};
const iBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(0,0,0,0.10)';
  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)';
  e.target.style.background = 'rgba(255,255,255,0.84)';
};

const SH = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '7px 11px', borderRadius: '9px', marginBottom: '10px',
    background: 'rgba(255,243,195,0.65)',
    border: '1px solid rgba(200,144,10,0.18)',
  }}>
    <span style={{ color: '#C8900A', display: 'flex', flexShrink: 0 }}>{icon}</span>
    <span style={{ fontWeight: 700, fontSize: '13px', color: '#17213D' }}>{title}</span>
  </div>
);

const F = ({ label, error, required, icon, children }: {
  label: string; error?: string; required?: boolean; icon: React.ReactNode; children: React.ReactNode;
}) => (
  <div>
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '3px' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#C8900A', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      {children}
    </div>
    {error && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{error}</p>}
  </div>
);

const ic = { width: '13px', height: '13px' };

export const Step1PersonalDetails = () => {
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const { setStep, updateStep1, data } = useRegistrationStore();
  const { setUser, setDriver, setAccessToken, accessToken } = useAuthStore();
  const toast = useToast();

  const [locState, setLocState] = useState<'idle' | 'shown' | 'fetching' | 'done'>('idle');

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...data.step1, registrationType: data.step1?.registrationType || 'DRIVER_ONLY' },
  });

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('File too large', 'Max 5MB'); return; }
    // Show preview immediately
    const r = new FileReader();
    r.onload = () => setPhoto(r.result as string);
    r.readAsDataURL(f);
    // Upload to Cloudinary
    setPhotoStatus('uploading');
    try {
      const result = await uploadDocument(f, 'PROFILE_PHOTO');
      setPhotoUrl(result.url);
      setPhotoStatus('done');
      // Save URL to backend (fire and forget — token may not exist yet at this point)
      documentService.saveUrl({ documentType: 'PROFILE_PHOTO', fileUrl: result.url, fileName: f.name, mimeType: f.type, fileSize: result.bytes }).catch(() => {});
    } catch {
      setPhotoStatus('error');
      toast.error('Photo upload failed', 'Your photo preview is saved. Try again or re-upload in Step 3.');
    }
    e.target.value = '';
  };

  /* Auto-fill if permission already granted — no prompt needed */
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        setLocState('fetching');
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const d = await r.json();
            applyLocation(d.address || {});
          } catch { /* ignore */ }
          setLocState('done');
        }, () => setLocState('idle'));
      }
    }).catch(() => { /* permissions API not available */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddrFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    iFocus(e);
    if (locState === 'idle') setLocState('shown');
  };

  /* Maps a Nominatim address object to form fields cleanly */
  const applyLocation = (a: Record<string, string>) => {
    // Door / House No — from house_number only
    const door = a.house_number || '';
    setValue('doorNumber', door, { shouldValidate: !!door });

    // Street — road field, but strip leading house_number if Nominatim mixed it in
    let road = a.road || a.pedestrian || a.footway || a.path || '';
    if (door && road.toLowerCase().startsWith(door.toLowerCase())) {
      road = road.slice(door.length).replace(/^[\s,\-]+/, '').trim();
    }
    setValue('street', road, { shouldValidate: !!road });

    // Village / City
    const city = a.city || a.town || a.village || a.suburb || '';
    if (city) setValue('village', city, { shouldValidate: true });

    // District
    const dist = a.state_district || a.county || a.district || '';
    if (dist) setValue('district', dist, { shouldValidate: true });

    // State — match against known states list
    const st = a.state || '';
    if (st) {
      const matched = STATES.find(s => s.toLowerCase() === st.toLowerCase());
      if (matched) setValue('state', matched, { shouldValidate: true });
    }

    // PIN Code
    const pin = a.postcode || '';
    if (/^\d{6}$/.test(pin)) setValue('pinCode', pin, { shouldValidate: true });
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) { setLocState('done'); return; }
    setLocState('fetching');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const d = await r.json();
        applyLocation(d.address || {});
      } catch { /* silently continue */ }
      setLocState('done');
    }, () => setLocState('done'));
  };

  const handlePhotoClick = async () => {
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch {
        // Permission denied or unavailable — still open file picker
      }
    }
    photoRef.current?.click();
  };

  const saveStep1Data = async (d: FormData) => {
    try {
      await driverService.registerStep(1, {
        fullName: d.fullName,
        dateOfBirth: d.dateOfBirth,
        gender: d.gender,
        mobileNumber: d.mobileNumber,
        alternateMobile: d.alternateMobile || undefined,
        registrationType: d.registrationType,
        profilePhotoUrl: photoUrl || undefined,
        address: { doorNumber: d.doorNumber, street: d.street, village: d.village, district: d.district, state: d.state, pinCode: d.pinCode },
      });
    } catch { /* silently continue — data saved locally */ }
  };

  const onSubmit = async (d: FormData) => {
    setLoading(true);
    if (accessToken) {
      // Already registered — just update address/profile data
      updateStep1(d);
      await saveStep1Data(d);
      setLoading(false);
      setStep(2);
      return;
    }
    try {
      const res = await authService.register({ email: d.email, password: d.password, fullName: d.fullName, mobileNumber: d.mobileNumber });
      const { accessToken: token, refreshToken, user, driver } = res.data.data;
      setAccessToken(token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      if (driver) setDriver(driver);
      updateStep1(d);
      await saveStep1Data(d);
      setStep(2);
      toast.success('Step 1 Complete', 'Continue to driving details.');
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e?.response?.status === 429) {
        updateStep1(d);
        setStep(2);
        return;
      }
      toast.error('Error', e?.response?.data?.error || 'Failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .s1-pi-row { display:flex; gap:16px; align-items:flex-start; }
        .s1-pi-grid { flex:1; min-width:0; display:grid; grid-template-columns:repeat(3,1fr); gap:8px 10px; }
        .s1-bottom { display:grid; grid-template-columns:1.35fr 1fr; gap:12px; }
        .s1-addr-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px 10px; }
        .s1-nav { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid rgba(0,0,0,0.08); margin-top:2px; gap:8px; }
        @media(max-width:768px){
          .s1-pi-row{ flex-direction:column; align-items:center; }
          .s1-pi-grid{ grid-template-columns:1fr 1fr; }
          .s1-bottom{ grid-template-columns:1fr; }
          .s1-addr-grid{ grid-template-columns:1fr 1fr; }
        }
        @media(max-width:480px){
          .s1-pi-grid{ grid-template-columns:1fr; }
          .s1-addr-grid{ grid-template-columns:1fr; }
          .s1-nav{ flex-direction:column; }
          .s1-nav button{ width:100%; justify-content:center; }
        }
      `}</style>

      {/* ── PERSONAL INFORMATION ── */}
      <section>
        <SH icon={<User style={ic} />} title="Personal Information" />
        <div className="s1-pi-row">

          {/* Photo upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0, width: '94px' }}>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png" capture="user" style={{ display: 'none' }} onChange={onPhotoChange} />
            {/* Wrapper — position:relative but NO overflow:hidden so badge isn't clipped */}
            <div onClick={handlePhotoClick} style={{ position: 'relative', width: '86px', height: '86px', cursor: 'pointer' }}>
              <div style={{
                width: '86px', height: '86px', borderRadius: '50%',
                border: '2px dashed rgba(200,144,10,0.60)',
                background: photo ? 'transparent' : 'rgba(255,243,195,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {photo
                  ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User style={{ width: '28px', height: '28px', color: '#C8900A' }} />
                }
              </div>
              {/* Camera badge outside the overflow:hidden circle */}
              <div style={{
                position: 'absolute', bottom: '2px', right: '2px', width: '24px', height: '24px',
                borderRadius: '50%', background: 'linear-gradient(135deg,#F5C842,#C8900A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff', pointerEvents: 'none',
              }}>
                <Camera style={{ width: '11px', height: '11px', color: '#fff' }} />
              </div>
            </div>
            {photoStatus === 'uploading' && (
              <span style={{ fontSize: '10px', color: '#C8900A', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Uploading…
              </span>
            )}
            {photoStatus === 'done' && (
              <span style={{ fontSize: '10px', color: '#16a34a', textAlign: 'center', fontWeight: 600 }}>✓ Uploaded</span>
            )}
            {photoStatus === 'error' && (
              <span style={{ fontSize: '10px', color: '#ef4444', textAlign: 'center' }}>⚠ Upload failed</span>
            )}
            {photoStatus === 'idle' && (
              <span style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', lineHeight: 1.4 }}>
                Upload Photo<br /><span style={{ color: '#9ca3af', fontSize: '9.5px' }}>JPG, PNG • Max 5 MB</span>
              </span>
            )}
          </div>

          {/* Fields grid */}
          <div className="s1-pi-grid">
            {/* Full Name — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <F label="Full Name" required error={errors.fullName?.message} icon={<User style={ic} />}>
                <input {...register('fullName')} placeholder="Enter full name" style={I} onFocus={iFocus} onBlur={iBlur} />
              </F>
            </div>
            {/* Row 2 */}
            <F label="Date of Birth" required error={errors.dateOfBirth?.message} icon={<Calendar style={ic} />}>
              <input type="date" {...register('dateOfBirth')} style={I} onFocus={iFocus} onBlur={iBlur} />
            </F>
            <Controller name="gender" control={control} render={({ field }) => (
              <F label="Gender" required error={errors.gender?.message} icon={<User style={ic} />}>
                <select {...field} style={{ ...I, appearance: 'none', cursor: 'pointer' }} onFocus={iFocus} onBlur={iBlur}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </F>
            )} />
            <F label="Mobile Number" required error={errors.mobileNumber?.message} icon={<Phone style={ic} />}>
              <input {...register('mobileNumber')} placeholder="Enter mobile number" style={I} onFocus={iFocus} onBlur={iBlur} />
            </F>
            {/* Row 3 */}
            <F label="Alternate Mobile" error={errors.alternateMobile?.message} icon={<Phone style={ic} />}>
              <input {...register('alternateMobile')} placeholder="Alternate number" style={I} onFocus={iFocus} onBlur={iBlur} />
            </F>
            <F label="Email Address" required error={errors.email?.message} icon={<Mail style={ic} />}>
              <input type="email" {...register('email')} placeholder="Enter email address" style={I} onFocus={iFocus} onBlur={iBlur} />
            </F>
            <F label="Password" required error={errors.password?.message} icon={<Lock style={ic} />}>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} {...register('password')} placeholder="Create password"
                  style={{ ...I, paddingRight: '32px' }} onFocus={iFocus} onBlur={iBlur} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff style={ic} /> : <Eye style={ic} />}
                </button>
              </div>
            </F>
            {/* Row 4 — Confirm Password (1 col) */}
            <F label="Confirm Password" required error={errors.confirmPassword?.message} icon={<Lock style={ic} />}>
              <div style={{ position: 'relative' }}>
                <input type={showCPw ? 'text' : 'password'} {...register('confirmPassword')} placeholder="Confirm password"
                  style={{ ...I, paddingRight: '32px' }} onFocus={iFocus} onBlur={iBlur} />
                <button type="button" onClick={() => setShowCPw(v => !v)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showCPw ? <EyeOff style={ic} /> : <Eye style={ic} />}
                </button>
              </div>
            </F>
          </div>
        </div>
      </section>

      {/* ── BOTTOM ROW: Address | Registration Type ── */}
      <div className="s1-bottom">

        {/* Address Details */}
        <section>
          <SH icon={<MapPin style={ic} />} title="Address Details" />

          {/* Location prompt banner */}
          {locState === 'shown' && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', borderRadius:'9px', background:'rgba(255,243,195,0.80)', border:'1px solid rgba(200,144,10,0.30)', marginBottom:'8px', flexWrap:'wrap' }}>
              <MapPin style={{ width:'13px', height:'13px', color:'#C8900A', flexShrink:0 }} />
              <span style={{ fontSize:'11.5px', color:'#36445E', flex:1, minWidth:'120px' }}>Fetch your current location?</span>
              <div style={{ display:'flex', gap:'6px' }}>
                <button type="button" onClick={fetchLocation}
                  style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'6px', cursor:'pointer', background:'linear-gradient(135deg,#F5C842,#C8900A)', color:'#fff', border:'none' }}>
                  Use My Location
                </button>
                <button type="button" onClick={() => setLocState('done')}
                  style={{ fontSize:'11px', fontWeight:600, padding:'4px 10px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,255,255,0.75)', border:'1px solid rgba(0,0,0,0.12)', color:'#64748B' }}>
                  Enter Manually
                </button>
              </div>
            </div>
          )}
          {locState === 'fetching' && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', borderRadius:'9px', background:'rgba(240,253,244,0.85)', border:'1px solid #86efac', marginBottom:'8px' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', border:'2px solid #22c55e', borderTopColor:'transparent', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
              <span style={{ fontSize:'11.5px', color:'#16a34a', fontWeight:600 }}>Detecting your location…</span>
            </div>
          )}
          {locState === 'done' && (
            <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 10px', borderRadius:'9px', background:'rgba(240,253,244,0.80)', border:'1px solid #86efac', marginBottom:'8px' }}>
              <span style={{ fontSize:'11px', color:'#16a34a', fontWeight:600 }}>✓ Location applied — review and edit if needed</span>
            </div>
          )}

          <div className="s1-addr-grid">
            <F label="Door / House No." required error={errors.doorNumber?.message} icon={<Hash style={ic} />}>
              <input {...register('doorNumber')} placeholder="Door number" style={I} onFocus={onAddrFocus} onBlur={iBlur} />
            </F>
            <F label="Street" required error={errors.street?.message} icon={<MapPin style={ic} />}>
              <input {...register('street')} placeholder="Street name" style={I} onFocus={onAddrFocus} onBlur={iBlur} />
            </F>
            <F label="Village / City" required error={errors.village?.message} icon={<MapPin style={ic} />}>
              <input {...register('village')} placeholder="Village or city" style={I} onFocus={onAddrFocus} onBlur={iBlur} />
            </F>
            <F label="District" required error={errors.district?.message} icon={<MapPin style={ic} />}>
              <input {...register('district')} placeholder="District" style={I} onFocus={onAddrFocus} onBlur={iBlur} />
            </F>
            <Controller name="state" control={control} render={({ field }) => (
              <F label="State" required error={errors.state?.message} icon={<MapPin style={ic} />}>
                <select {...field} style={{ ...I, appearance: 'none', cursor: 'pointer' }} onFocus={onAddrFocus} onBlur={iBlur}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
            )} />
            <F label="PIN Code" required error={errors.pinCode?.message} icon={<Hash style={ic} />}>
              <input {...register('pinCode')} placeholder="6 digit PIN" maxLength={6} style={I} onFocus={onAddrFocus} onBlur={iBlur} />
            </F>
          </div>
        </section>

        {/* Registration Type */}
        <section>
          <SH icon={<UserCheck style={ic} />} title="Registration Type" />
          <Controller name="registrationType" control={control} render={({ field }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {([
                { v: 'DRIVER_ONLY' as const, icon: UserCheck, t: 'Driver Only', d: 'Register as a professional driver. Drive vehicles provided by the agency.' },
                { v: 'DRIVER_WITH_VEHICLE' as const, icon: Car, t: 'Driver + Own Vehicle', d: 'Have your own vehicle. Provide both driving and vehicle services.' },
              ] as const).map(({ v, icon: Icon, t, d }) => {
                const sel = field.value === v;
                return (
                  <button key={v} type="button" onClick={() => field.onChange(v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                      borderRadius: '12px', textAlign: 'left', cursor: 'pointer', width: '100%',
                      background: sel ? 'rgba(255,243,195,0.72)' : 'rgba(255,255,255,0.55)',
                      border: sel ? '1.5px solid #C8900A' : '1.5px solid rgba(0,0,0,0.09)',
                      boxShadow: sel ? '0 3px 14px rgba(200,144,10,0.20)' : '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.18s',
                    }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: sel ? 'rgba(200,144,10,0.18)' : 'rgba(0,0,0,0.05)',
                    }}>
                      <Icon style={{ width: '18px', height: '18px', color: sel ? '#C8900A' : '#9ca3af' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '12.5px', color: '#17213D', margin: '0 0 2px' }}>{t}</p>
                      <p style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>{d}</p>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: sel ? 'linear-gradient(135deg,#F5C842,#C8900A)' : 'transparent',
                      border: sel ? 'none' : '1.5px solid rgba(0,0,0,0.18)',
                      transition: 'all 0.18s',
                    }}>
                      {sel && <Check style={{ width: '11px', height: '11px', color: '#fff' }} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )} />
        </section>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="s1-nav">
        <button type="button" disabled
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed', opacity: 0.45, background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.12)', color: '#64748B' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
        </button>
        <button type="submit" disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)', color: '#fff', border: 'none', boxShadow: '0 5px 18px rgba(200,144,10,0.38)', transition: 'filter 0.15s', opacity: loading ? 0.72 : 1 }}>
          {loading ? 'Saving…' : <><span>Continue</span><ArrowRight style={{ width: '14px', height: '14px' }} /></>}
        </button>
      </div>
    </form>
  );
};
