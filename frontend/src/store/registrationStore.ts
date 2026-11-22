import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegistrationData } from '../types';

interface RegistrationState {
  currentStep: number;
  data: RegistrationData;
  setStep: (step: number) => void;
  updateStep1: (data: Partial<RegistrationData['step1']>) => void;
  updateStep2: (data: Partial<RegistrationData['step2']>) => void;
  clearRegistration: () => void;
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: {},
      setStep: (step) => set({ currentStep: step }),
      updateStep1: (data) =>
        set((state) => ({
          data: { ...state.data, step1: { ...state.data.step1, ...data } as RegistrationData['step1'] },
        })),
      updateStep2: (data) =>
        set((state) => ({
          data: { ...state.data, step2: { ...state.data.step2, ...data } as RegistrationData['step2'] },
        })),
      clearRegistration: () => set({ currentStep: 1, data: {} }),
    }),
    {
      name: 'registration-draft',
    }
  )
);
