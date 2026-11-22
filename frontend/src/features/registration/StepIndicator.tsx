import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string }[];
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 20px', borderRadius: '16px',
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1.5px solid rgba(255,255,255,0.95)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  }}>
    {steps.map((step, index) => {
      const n = index + 1;
      const done = n < currentStep;
      const active = n === currentStep;
      const last = index === steps.length - 1;
      return (
        <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
            {/* Circle */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, transition: 'all 0.3s',
              background: done || active
                ? 'linear-gradient(135deg,#F5C842 0%,#C8900A 55%,#A97000 100%)'
                : 'rgba(255,255,255,0.65)',
              color: done || active ? '#fff' : '#9ca3af',
              border: done || active ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
              boxShadow: active
                ? '0 0 0 5px rgba(200,144,10,0.18), 0 3px 12px rgba(200,144,10,0.38)'
                : done ? '0 2px 10px rgba(200,144,10,0.28)' : 'none',
            }}>
              {done ? <Check strokeWidth={2.8} style={{ width: '15px', height: '15px' }} /> : n}
            </div>
            {/* Label */}
            <div style={{ marginTop: '6px', textAlign: 'center' }}>
              <p style={{
                fontSize: '11px', fontWeight: active ? 700 : 500, margin: 0, whiteSpace: 'nowrap',
                color: active ? '#A97000' : done ? '#C8900A' : '#9ca3af',
                transition: 'color 0.3s',
              }}>
                {step.label}
              </p>
              {active && (
                <div style={{ width: '20px', height: '2px', borderRadius: '2px', background: '#C8900A', margin: '4px auto 0' }} />
              )}
            </div>
          </div>

          {!last && (
            <div style={{
              width: '60px', height: '2px', borderRadius: '2px', flexShrink: 0, marginBottom: '22px',
              background: done
                ? 'linear-gradient(90deg,#C8900A,#F5C842)'
                : 'rgba(0,0,0,0.09)',
              transition: 'background 0.4s',
            }} />
          )}
        </div>
      );
    })}
  </div>
);
