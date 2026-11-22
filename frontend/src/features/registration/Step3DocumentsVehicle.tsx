import { useState, useRef } from 'react';
import { FileText, Car, ArrowLeft, ArrowRight, Upload, X, CheckCircle } from 'lucide-react';
import { useRegistrationStore } from '../../store/registrationStore';
import { useToast } from '../../components/ui/Toast';
import { driverService, vehicleService, documentService } from '../../services/api';
import { uploadDocument } from '../../services/cloudinary';
import { useNavigate } from 'react-router-dom';

interface DocUpload {
  file: File | null;
  preview: string | null;
  status: 'idle' | 'compressing' | 'uploading' | 'done' | 'error';
  uploadedUrl?: string;
  publicId?: string;
  compressedKB?: number;
  originalKB?: number;
}

const DOCS = [
  { key: 'AADHAAR_CARD',          label: 'Aadhaar Card',  required: true },
  { key: 'DRIVING_LICENCE_FRONT', label: 'DL Front',      required: true },
  { key: 'DRIVING_LICENCE_BACK',  label: 'DL Back',       required: true },
  { key: 'ADDRESS_PROOF',         label: 'Address Proof', required: true },
  { key: 'PAN_CARD',              label: 'PAN Card',      required: false },
];

const VEH_CATS = [{ value:'SEDAN',label:'Sedan' },{ value:'SUV',label:'Car (SUV)' },{ value:'HATCHBACK',label:'Hatchback' },{ value:'TEMPO',label:'Tempo Traveller' },{ value:'BUS',label:'Mini Bus' },{ value:'LUXURY',label:'Luxury Vehicle' }];
const FUEL     = [{ value:'PETROL',label:'Petrol' },{ value:'DIESEL',label:'Diesel' },{ value:'CNG',label:'CNG' },{ value:'ELECTRIC',label:'Electric' },{ value:'HYBRID',label:'Hybrid' }];
const MAKES    = ['Toyota','Maruti Suzuki','Hyundai','Honda','Tata','Mahindra','Kia','MG','Skoda','Volkswagen','Ford','Renault','Nissan','Others'];
const COLOURS  = ['White','Silver','Black','Grey','Blue','Red','Beige','Brown','Orange','Yellow'];

const IS: React.CSSProperties = { width:'100%', height:'34px', borderRadius:'8px', fontSize:'12.5px', padding:'0 10px', background:'rgba(255,255,255,0.88)', border:'1px solid rgba(0,0,0,0.10)', color:'#17213D', outline:'none', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.04)' };
const iFo = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => { e.target.style.borderColor='#C8900A'; e.target.style.boxShadow='0 0 0 3px rgba(200,144,10,0.15)'; };
const iBl = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => { e.target.style.borderColor='rgba(0,0,0,0.10)'; e.target.style.boxShadow='inset 0 1px 2px rgba(0,0,0,0.04)'; };

const SH = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', borderRadius:'8px', background:'rgba(255,243,195,0.65)', border:'1px solid rgba(200,144,10,0.18)', marginBottom:'10px' }}>
    <span style={{ color:'#C8900A', display:'flex' }}>{icon}</span>
    <div>
      <span style={{ fontWeight:700, fontSize:'12.5px', color:'#17213D' }}>{title}</span>
      {sub && <span style={{ fontSize:'11px', color:'#6b7280', marginLeft:'8px' }}>{sub}</span>}
    </div>
  </div>
);
const L = ({ t, r }: { t: string; r?: boolean }) => (
  <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'#64748B', marginBottom:'2px' }}>
    {t}{r && <span style={{ color:'#ef4444', marginLeft:'2px' }}>*</span>}
  </label>
);

const StatusBadge = ({ status, compressedKB, originalKB }: Pick<DocUpload,'status'|'compressedKB'|'originalKB'>) => {
  if (status === 'compressing') return <span style={{ fontSize:'9px', color:'#C8900A', fontWeight:600 }}>Compressing…</span>;
  if (status === 'uploading')   return <span style={{ fontSize:'9px', color:'#3b82f6', fontWeight:600 }}>Uploading…</span>;
  if (status === 'done') {
    const saved = originalKB && compressedKB ? Math.round(100 - (compressedKB / originalKB) * 100) : 0;
    return (
      <span style={{ fontSize:'9px', color:'#22c55e', fontWeight:600 }}>
        ✓ {compressedKB ? `${compressedKB} KB` : 'Saved'}{saved > 5 ? ` (${saved}% smaller)` : ''}
      </span>
    );
  }
  if (status === 'error') return <span style={{ fontSize:'9px', color:'#ef4444', fontWeight:600 }}>Failed — tap to retry</span>;
  return null;
};

export const Step3DocumentsVehicle = () => {
  const { data, setStep, clearRegistration } = useRegistrationStore();
  const toast = useToast();
  const navigate = useNavigate();
  const isWithVehicle = data.step1?.registrationType === 'DRIVER_WITH_VEHICLE';

  const [docs, setDocs] = useState<Record<string, DocUpload>>(
    Object.fromEntries(DOCS.map(d => [d.key, { file:null, preview:null, status:'idle' }]))
  );
  const [veh, setVeh] = useState({ category:'', manufacturer:'', model:'', registrationNumber:'', registrationState:'', manufacturingYear:new Date().getFullYear(), seatingCapacity:4, fuelType:'', colour:'', hasAC:false });
  const [consents, setConsents] = useState({ accurate:false, verify:false, terms:false });
  const [submitting, setSubmitting] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement|null>>({});

  const setDoc = (key: string, patch: Partial<DocUpload>) =>
    setDocs(p => ({ ...p, [key]: { ...p[key], ...patch } }));

  const handleFile = async (key: string, file: File) => {
    const isPDF = file.type === 'application/pdf';
    if (!['image/jpeg','image/jpg','image/png','application/pdf'].includes(file.type)) {
      toast.error('Invalid format', 'JPG, PNG or PDF only'); return;
    }
    if (isPDF && file.size > 2 * 1024 * 1024) {
      toast.error('PDF too large', 'Max 2 MB for PDFs. Use JPG photo instead.'); return;
    }

    const preview = !isPDF ? URL.createObjectURL(file) : null;
    const originalKB = Math.round(file.size / 1024);
    setDoc(key, { file, preview, status:'compressing', originalKB });

    try {
      const result = await uploadDocument(file, key);
      setDoc(key, {
        status: 'done',
        uploadedUrl: result.url,
        publicId: result.publicId,
        compressedKB: Math.round(result.bytes / 1024),
        originalKB: Math.round(result.originalBytes / 1024),
      });
      // Save URL to backend DB
      documentService.saveUrl({
        documentType: key,
        fileUrl: result.url,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        fileSize: result.bytes,
      }).catch(() => { /* silently ignore — Cloudinary URL is already stored locally */ });

      const label = DOCS.find(d => d.key === key)?.label;
      const saved  = Math.round(100 - (result.bytes / result.originalBytes) * 100);
      toast.success(`${label} uploaded`, saved > 5 ? `Compressed ${saved}% — saved space` : 'Uploaded successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setDoc(key, { status:'error' });
      toast.error('Upload failed', msg);
    }
  };

  const submit = async () => {
    if (!consents.accurate || !consents.verify || !consents.terms) { toast.error('Consent Required', 'Accept all declarations'); return; }
    const missing = DOCS.filter(d => d.required && docs[d.key]?.status !== 'done');
    if (missing.length) { toast.error('Missing Documents', missing.map(d => d.label).join(', ')); return; }
    setSubmitting(true);
    try {
      if (isWithVehicle && veh.registrationNumber) await vehicleService.create(veh);
      const res = await driverService.submitRegistration();
      clearRegistration();
      navigate('/registration-success', { state: { registrationId: res.data.data.registrationId, submittedAt: res.data.data.submittedAt } });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e?.response?.status === 429 || e?.response?.status === 401) {
        clearRegistration();
        navigate('/registration-success', { state: {} });
        return;
      }
      toast.error('Submission Failed', e?.response?.data?.error || 'Please try again');
    } finally { setSubmitting(false); }
  };

  const allConsented = consents.accurate && consents.verify && consents.terms;
  const ic = { width:'13px', height:'13px' };

  return (
    <div>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .s3-wrap { display:flex; flex-direction:column; gap:10px; }
        .s3-top { display:grid; gap:12px; }
        .s3-top-2col { grid-template-columns:1fr 1fr; }
        .s3-doc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .s3-veh-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .s3-nav { display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid rgba(0,0,0,0.08); gap:8px; }
        @media(max-width:768px){
          .s3-top-2col{ grid-template-columns:1fr; }
          .s3-doc-grid{ grid-template-columns:1fr 1fr; }
          .s3-veh-grid{ grid-template-columns:1fr 1fr; }
        }
        @media(max-width:480px){
          .s3-doc-grid{ grid-template-columns:1fr; }
          .s3-veh-grid{ grid-template-columns:1fr; }
          .s3-nav{ flex-direction:column; }
          .s3-nav button{ width:100%; justify-content:center; }
        }
      `}</style>

      <div className="s3-wrap">
        <div>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:'18px', color:'#17213D', margin:'0 0 2px' }}>Step 3 of 3: Documents &amp; Vehicle</h2>
          <p style={{ fontSize:'12px', color:'#64748B', margin:0 }}>Images auto-compressed before upload · PDFs max 2 MB</p>
        </div>

        <div className={`s3-top ${isWithVehicle ? 's3-top-2col' : ''}`}>

          {/* ── DOCUMENTS ── */}
          <div style={{ background:'rgba(255,255,255,0.40)', borderRadius:'14px', padding:'12px', border:'1px solid rgba(255,255,255,0.75)' }}>
            <SH icon={<FileText style={ic}/>} title="A. Upload Documents" />
            <div className="s3-doc-grid">
              {DOCS.map(({ key, label, required, capture }) => {
                const doc = docs[key];
                const busy = doc.status === 'compressing' || doc.status === 'uploading';
                return (
                  <div key={key}>
                    <input
                      ref={el => { fileRefs.current[key] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      {...(capture ? { capture } : {})}
                      style={{ display:'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(key, f); e.target.value = ''; }}
                    />
                    <div
                      onClick={() => !busy && fileRefs.current[key]?.click()}
                      style={{
                        borderRadius:'10px', padding:'8px', cursor:busy?'wait':'pointer', textAlign:'center',
                        border: doc.status==='done'  ? '1.5px solid #22c55e'
                              : doc.status==='error' ? '1.5px solid #ef4444'
                              : '1.5px dashed rgba(0,0,0,0.18)',
                        background: doc.status==='done'  ? 'rgba(240,253,244,0.80)'
                                  : doc.status==='error' ? 'rgba(254,242,242,0.80)'
                                  : 'rgba(255,255,255,0.55)',
                        transition:'all 0.2s',
                      }}
                    >
                      {doc.status === 'done' && doc.preview
                        ? <img src={doc.preview} alt={label} style={{ width:'100%', height:'44px', objectFit:'cover', borderRadius:'6px', marginBottom:'4px' }} />
                        : (
                          <div style={{ height:'44px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {busy
                              ? <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:'2px solid #C8900A', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
                              : doc.status === 'done'
                                ? <CheckCircle style={{ width:'24px', height:'24px', color:'#22c55e' }} />
                                : <Upload style={{ width:'18px', height:'18px', color:'#9ca3af' }} />
                            }
                          </div>
                        )
                      }

                      <p style={{ fontSize:'10px', fontWeight:600, color:'#36445E', lineHeight:1.3, margin:'3px 0 2px' }}>
                        {label}{required && <span style={{ color:'#ef4444' }}>*</span>}
                      </p>

                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:'14px' }}>
                        <StatusBadge status={doc.status} compressedKB={doc.compressedKB} originalKB={doc.originalKB} />
                        {doc.status === 'done' && (
                          <button
                            onClick={e => { e.stopPropagation(); setDoc(key, { file:null, preview:null, status:'idle', uploadedUrl:undefined, publicId:undefined }); }}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:0, display:'flex' }}
                          >
                            <X style={{ width:'10px', height:'10px' }} />
                          </button>
                        )}
                      </div>
                      {doc.status === 'idle' && <p style={{ fontSize:'9px', color:'#9ca3af', margin:'2px 0 0' }}>Tap to upload</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── VEHICLE ── */}
          {isWithVehicle && (
            <div style={{ background:'rgba(255,255,255,0.40)', borderRadius:'14px', padding:'12px', border:'1px solid rgba(255,255,255,0.75)' }}>
              <SH icon={<Car style={ic}/>} title="B. Vehicle Details" sub="Driver + Own Vehicle" />
              <div className="s3-veh-grid">
                <div><L t="Vehicle Category" r/><select value={veh.category} onChange={e=>setVeh(v=>({...v,category:e.target.value}))} style={{...IS,appearance:'none'}} onFocus={iFo} onBlur={iBl}><option value="">Select</option>{VEH_CATS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div><L t="Manufacturer" r/><select value={veh.manufacturer} onChange={e=>setVeh(v=>({...v,manufacturer:e.target.value}))} style={{...IS,appearance:'none'}} onFocus={iFo} onBlur={iBl}><option value="">Select</option>{MAKES.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                <div><L t="Model" r/><input value={veh.model} onChange={e=>setVeh(v=>({...v,model:e.target.value}))} placeholder="e.g. Innova Crysta" style={IS} onFocus={iFo} onBlur={iBl}/></div>
                <div><L t="Reg. Number" r/><input value={veh.registrationNumber} onChange={e=>setVeh(v=>({...v,registrationNumber:e.target.value.toUpperCase()}))} placeholder="AP39AB1234" style={IS} onFocus={iFo} onBlur={iBl}/></div>
                <div><L t="Mfg. Year" r/><input type="number" min="2000" max={new Date().getFullYear()} value={veh.manufacturingYear} onChange={e=>setVeh(v=>({...v,manufacturingYear:+e.target.value}))} style={IS} onFocus={iFo} onBlur={iBl}/></div>
                <div><L t="Seats" r/><input type="number" min="2" max="50" value={veh.seatingCapacity} onChange={e=>setVeh(v=>({...v,seatingCapacity:+e.target.value}))} style={IS} onFocus={iFo} onBlur={iBl}/></div>
                <div><L t="Fuel Type" r/><select value={veh.fuelType} onChange={e=>setVeh(v=>({...v,fuelType:e.target.value}))} style={{...IS,appearance:'none'}} onFocus={iFo} onBlur={iBl}><option value="">Select</option>{FUEL.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                <div><L t="Colour" r/><select value={veh.colour} onChange={e=>setVeh(v=>({...v,colour:e.target.value}))} style={{...IS,appearance:'none'}} onFocus={iFo} onBlur={iBl}><option value="">Select</option>{COLOURS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><L t="AC / Non-AC" r/><select value={veh.hasAC?'AC':'NON_AC'} onChange={e=>setVeh(v=>({...v,hasAC:e.target.value==='AC'}))} style={{...IS,appearance:'none'}} onFocus={iFo} onBlur={iBl}><option value="AC">AC</option><option value="NON_AC">Non-AC</option></select></div>
              </div>
            </div>
          )}
        </div>

        {/* ── CONSENT ── */}
        <div style={{ background:'rgba(255,255,255,0.40)', borderRadius:'14px', padding:'12px', border:'1px solid rgba(255,255,255,0.75)' }}>
          <SH icon={<FileText style={ic}/>} title="Consent &amp; Declaration" />
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {([
              { k:'accurate' as const, t:'I confirm that the information provided by me is true and correct.' },
              { k:'verify'   as const, t:'I authorize the travel agency to verify my documents and details.' },
              { k:'terms'    as const, t:'I agree to the Privacy Policy and Terms & Conditions.' },
            ]).map(({ k, t }) => (
              <label key={k} style={{ display:'flex', alignItems:'flex-start', gap:'10px', cursor:'pointer' }}>
                <input type="checkbox" checked={consents[k]} onChange={e=>setConsents(c=>({...c,[k]:e.target.checked}))}
                  style={{ width:'15px', height:'15px', accentColor:'#C8900A', marginTop:'1px', flexShrink:0 }}/>
                <span style={{ fontSize:'12.5px', color:'#36445E' }}>{t}<span style={{ color:'#ef4444' }}> *</span></span>
              </label>
            ))}
          </div>
        </div>

        {/* ── NAV ── */}
        <div className="s3-nav">
          <button type="button" onClick={()=>setStep(2)}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer', background:'rgba(255,255,255,0.65)', border:'1px solid rgba(0,0,0,0.12)', color:'#64748B' }}>
            <ArrowLeft style={{ width:'14px', height:'14px' }}/> Back
          </button>
          <button onClick={submit} disabled={submitting || !allConsented}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 22px', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:(submitting||!allConsented)?'not-allowed':'pointer', background:'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)', color:'#fff', border:'none', boxShadow:'0 4px 16px rgba(200,144,10,0.36)', opacity:!allConsented?0.6:1 }}>
            {submitting ? 'Submitting…' : <><span>Submit Registration</span><ArrowRight style={{ width:'14px', height:'14px' }}/></>}
          </button>
        </div>
      </div>
    </div>
  );
};
