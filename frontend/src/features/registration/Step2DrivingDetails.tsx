import { useForm, Controller, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import {
  Briefcase, FileText, AlertCircle, ArrowLeft, ArrowRight,
  Star, MapPin, Phone, User, Hash, Building2, CalendarDays, Check,
} from 'lucide-react';
import { useRegistrationStore } from '../../store/registrationStore';
import { useToast } from '../../components/ui/Toast';
import { driverService } from '../../services/api';

const schema = z.object({
  totalYears: z.preprocess(v => Number(v), z.number().min(0, 'Required')),
  previousCompany: z.string().optional(),
  employmentDuration: z.string().optional(),
  workDescription: z.string().optional(),
  licenceNumber: z.string().min(5, 'Licence number is required'),
  licenceClass: z.string().min(1, 'Licence class is required'),
  issuingAuthority: z.string().min(1, 'Issuing authority is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  stateOfIssue: z.string().min(1, 'State is required'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  preferredLocation: z.string().optional(),
  willingLongDistance: z.boolean(),
  emergencyContactName: z.string().min(2, 'Contact name is required'),
  emergencyContactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit number required'),
  emergencyRelationship: z.string().min(1, 'Relationship is required'),
});
type FormData = z.infer<typeof schema>;

const LICENCE_CLASSES = [
  { value: 'LMV', label: 'LMV - Light Motor Vehicle' },
  { value: 'HMV', label: 'HMV - Heavy Motor Vehicle' },
  { value: 'TRANS', label: 'Transport Vehicle' },
  { value: 'MCWG', label: 'MCWG - Motorcycle with Gear' },
  { value: 'LMV-TR', label: 'LMV-TR - Light Transport Vehicle' },
];
const LANGUAGES = ['Tamil','English','Hindi','Telugu','Kannada','Malayalam','Marathi','Bengali','Gujarati','Punjabi'];
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh'];
const RELATIONSHIPS = ['Spouse','Parent','Sibling','Child','Friend','Other'];

/* ── shared tokens ── */
const IS: React.CSSProperties = {
  width: '100%', height: '34px', borderRadius: '8px', fontSize: '12.5px',
  paddingLeft: '28px', paddingRight: '8px',
  background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.10)',
  color: '#17213D', outline: 'none',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, box-shadow 0.15s',
};
const iFo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = '#C8900A';
  e.target.style.boxShadow = '0 0 0 3px rgba(200,144,10,0.15)';
  e.target.style.background = '#fff';
};
const iBl = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'rgba(0,0,0,0.10)';
  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)';
  e.target.style.background = 'rgba(255,255,255,0.88)';
};
const ic = { width: '12px', height: '12px' };

/* ── sub-components ── */
const SH = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 10px', borderRadius: '8px', marginBottom: '7px', background: 'rgba(255,243,195,0.65)', border: '1px solid rgba(200,144,10,0.18)' }}>
    <span style={{ color: '#C8900A', display: 'flex', flexShrink: 0 }}>{icon}</span>
    <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#17213D' }}>{title}</span>
  </div>
);
const L = ({ t, r }: { t: string; r?: boolean }) => (
  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '2px' }}>
    {t}{r && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
  </label>
);
const E = ({ m }: { m?: string }) => m ? <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{m}</p> : null;
const F = ({ label, r, err, icon, children }: { label: string; r?: boolean; err?: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <L t={label} r={r} />
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#C8900A', pointerEvents: 'none', display: 'flex' }}>{icon}</span>
      {children}
    </div>
    <E m={err} />
  </div>
);



export const Step2DrivingDetails = () => {
  const [loading, setLoading] = useState(false);
  const { setStep, updateStep2, data } = useRegistrationStore();
  const toast = useToast();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { willingLongDistance: false, languages: [], ...(data.step2 as Partial<FormData>) },
  });

  const selLangs = watch('languages') || [];
  const toggleLang = (l: string) => setValue('languages', selLangs.includes(l) ? selLangs.filter(x => x !== l) : [...selLangs, l], { shouldValidate: true });

  const onSubmit: SubmitHandler<FormData> = async (d) => {
    setLoading(true);
    try {
      await driverService.registerStep(2, {
        experience: { totalYears: d.totalYears, previousCompany: d.previousCompany, employmentDuration: d.employmentDuration, workDescription: d.workDescription, languages: d.languages, preferredLocation: d.preferredLocation, willingLongDistance: d.willingLongDistance },
        licence: { licenceNumber: d.licenceNumber, licenceClass: d.licenceClass, issuingAuthority: d.issuingAuthority, issueDate: d.issueDate, expiryDate: d.expiryDate, stateOfIssue: d.stateOfIssue },
        emergencyContact: { contactName: d.emergencyContactName, contactNumber: d.emergencyContactNumber, relationship: d.emergencyRelationship },
      });
      updateStep2(d);
      setStep(3);
      toast.success('Step 2 Complete', 'Continue to documents.');
    } catch {
      // Advance regardless — data is saved locally
      updateStep2(d);
      setStep(3);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <style>{`
        .s2-g2    { display:grid; grid-template-columns:1fr 1fr; gap:7px 10px; }
        .s2-top   { display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:start; }
        .s2-bottom{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .s2-nav   { display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px solid rgba(0,0,0,0.08); gap:8px; }
        @media(max-width:900px){
          .s2-top  { grid-template-columns:1fr; }
          .s2-bottom{ grid-template-columns:1fr; }
        }
        @media(max-width:600px){
          .s2-g2{ grid-template-columns:1fr; }
          .s2-nav{ flex-direction:column; }
          .s2-nav button{ width:100%; justify-content:center; }
        }
      `}</style>

      {/* Title */}
      <div>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '18px', color: '#17213D', margin: '0 0 2px' }}>Step 2 of 3: Driving Details</h2>
        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Your experience, licence information, and preferences.</p>
      </div>

      {/* ── EXPERIENCE + LICENCE side by side ── */}
      <div className="s2-top">

        {/* Driving Licence — LEFT */}
        <section>
          <SH icon={<FileText style={ic} />} title="Driving Licence Details" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <F label="Driving Licence Number" r err={errors.licenceNumber?.message} icon={<Hash style={ic} />}>
              <input {...register('licenceNumber')} placeholder="e.g. TN1234567890123" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
            <div className="s2-g2">
              <Controller name="licenceClass" control={control} render={({ field }) => (
                <F label="Licence Class" r err={errors.licenceClass?.message} icon={<FileText style={ic} />}>
                  <select {...field} style={{ ...IS, appearance: 'none', cursor: 'pointer' }} onFocus={iFo} onBlur={iBl}>
                    <option value="">Select class</option>
                    {LICENCE_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </F>
              )} />
              <F label="Issuing Authority" r err={errors.issuingAuthority?.message} icon={<Building2 style={ic} />}>
                <input {...register('issuingAuthority')} placeholder="RTO office name" style={IS} onFocus={iFo} onBlur={iBl} />
              </F>
              <F label="Issue Date" r err={errors.issueDate?.message} icon={<CalendarDays style={ic} />}>
                <input type="date" {...register('issueDate')} style={IS} onFocus={iFo} onBlur={iBl} />
              </F>
              <F label="Expiry Date" r err={errors.expiryDate?.message} icon={<CalendarDays style={ic} />}>
                <input type="date" {...register('expiryDate')} style={IS} onFocus={iFo} onBlur={iBl} />
              </F>
            </div>
            <Controller name="stateOfIssue" control={control} render={({ field }) => (
              <F label="State of Issue" r err={errors.stateOfIssue?.message} icon={<MapPin style={ic} />}>
                <select {...field} style={{ ...IS, appearance: 'none', cursor: 'pointer' }} onFocus={iFo} onBlur={iBl}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
            )} />
          </div>
        </section>

        {/* Driving Experience — RIGHT */}
        <section>
          <SH icon={<Briefcase style={ic} />} title="Driving Experience" />
          <div className="s2-g2">
            <F label="Total Years of Experience" r err={errors.totalYears?.message} icon={<Hash style={ic} />}>
              <input type="number" min="0" max="50" {...register('totalYears')} placeholder="e.g. 3" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
            <F label="Previous Company / Agency" icon={<Building2 style={ic} />}>
              <input {...register('previousCompany')} placeholder="Optional" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
            <F label="Employment Duration" icon={<CalendarDays style={ic} />}>
              <input {...register('employmentDuration')} placeholder="e.g. 2 years 3 months" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
            <F label="Work Description" icon={<FileText style={ic} />}>
              <input {...register('workDescription')} placeholder="Brief description" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
          </div>
        </section>

      </div>

      {/* ── ADDITIONAL DETAILS + EMERGENCY CONTACT side by side ── */}
      <div className="s2-bottom">

        {/* Additional Details */}
        <section>
          <SH icon={<Star style={ic} />} title="Additional Details" />
          <L t="Languages Known" r />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '7px' }}>
            {LANGUAGES.map(l => {
              const sel = selLangs.includes(l);
              return (
                <button key={l} type="button" onClick={() => toggleLang(l)}
                  style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: sel ? 'linear-gradient(135deg,#FFE19A,#D99500)' : 'rgba(255,255,255,0.80)', color: sel ? '#fff' : '#36445E', border: sel ? 'none' : '1px solid rgba(0,0,0,0.12)', boxShadow: sel ? '0 2px 6px rgba(200,144,10,0.26)' : 'none' }}>
                  {sel && <Check style={{ width: '9px', height: '9px' }} strokeWidth={3} />}{l}
                </button>
              );
            })}
          </div>
          <E m={errors.languages?.message} />
          <F label="Preferred Working Location" icon={<MapPin style={ic} />}>
            <input {...register('preferredLocation')} placeholder="City or region" style={IS} onFocus={iFo} onBlur={iBl} />
          </F>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <input type="checkbox" id="wld" {...register('willingLongDistance')} style={{ width: '13px', height: '13px', accentColor: '#C8900A', cursor: 'pointer' }} />
            <label htmlFor="wld" style={{ fontSize: '11px', fontWeight: 600, color: '#36445E', cursor: 'pointer' }}>Willing to Travel Long Distance</label>
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <SH icon={<AlertCircle style={{ ...ic, color: '#ef4444' }} />} title="Emergency Contact" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <F label="Contact Name" r err={errors.emergencyContactName?.message} icon={<User style={ic} />}>
              <input {...register('emergencyContactName')} placeholder="Full name" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
            <F label="Contact Number" r err={errors.emergencyContactNumber?.message} icon={<Phone style={ic} />}>
              <input {...register('emergencyContactNumber')} placeholder="10-digit number" style={IS} onFocus={iFo} onBlur={iBl} />
            </F>
            <Controller name="emergencyRelationship" control={control} render={({ field }) => (
              <F label="Relationship" r err={errors.emergencyRelationship?.message} icon={<User style={ic} />}>
                <select {...field} style={{ ...IS, appearance: 'none', cursor: 'pointer' }} onFocus={iFo} onBlur={iBl}>
                  <option value="">Select relationship</option>
                  {RELATIONSHIPS.map(r => <option key={r} value={r.toUpperCase()}>{r}</option>)}
                </select>
              </F>
            )} />
          </div>
        </section>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="s2-nav">
        <button type="button" onClick={() => setStep(1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.12)', color: '#64748B' }}>
          <ArrowLeft style={{ width: '13px', height: '13px' }} /> Back
        </button>
        <button type="submit" disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 22px', borderRadius: '9px', fontSize: '12.5px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(200,144,10,0.36)', opacity: loading ? 0.72 : 1 }}>
          {loading ? 'Saving…' : <><span>Continue</span><ArrowRight style={{ width: '13px', height: '13px' }} /></>}
        </button>
      </div>
    </form>
  );
};
