import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, MapPin, Briefcase, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge, statusToBadge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { driverService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import type { FullDriver } from '../types';

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit number required'),
  alternateMobile: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TABS = ['Personal Details', 'Driving & Licence', 'Address', 'Emergency Contact'];

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const { driver } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: fullDriver, isLoading } = useQuery<FullDriver>({
    queryKey: ['driver-profile'],
    queryFn: () => driverService.getMe().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      fullName: fullDriver?.fullName || driver?.fullName || '',
      mobileNumber: fullDriver?.mobileNumber || driver?.mobileNumber || '',
      alternateMobile: fullDriver?.alternateMobile || '',
      dateOfBirth: fullDriver?.dateOfBirth ? new Date(fullDriver.dateOfBirth).toISOString().split('T')[0] : '',
      gender: fullDriver?.gender || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => driverService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      setEditing(false);
      toast.success('Profile Updated', 'Your changes have been saved successfully.');
    },
    onError: () => toast.error('Update Failed', 'Please try again.'),
  });

  const handleCancel = () => { setEditing(false); reset(); };

  const d = fullDriver || driver;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal information</p>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel} className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={handleSubmit(data => mutation.mutate(data))} loading={mutation.isPending} className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-gold-100 flex items-center justify-center">
            <User className="w-10 h-10 text-gold-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-navy-700">{d?.fullName || '—'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">ID: {d?.registrationId || '—'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={statusToBadge(d?.verificationStatus || '')}>
                {d?.verificationStatus?.replace(/_/g, ' ') || 'Pending'}
              </Badge>
              <Badge variant="default">
                {d?.registrationType === 'DRIVER_WITH_VEHICLE' ? 'Driver + Vehicle' : 'Driver Only'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Profile Completion</p>
            <p className="text-2xl font-bold text-gradient-gold">{d?.profileCompletionPercent || 0}%</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 p-1 bg-white/40 rounded-xl border border-white/60 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1',
              activeTab === i ? 'bg-gold-500 text-white shadow-gold' : 'text-slate-600 hover:text-navy-700 hover:bg-white/60')}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-700">Personal Details</h3>
          </div>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Full Name" error={errors.fullName?.message} required {...register('fullName')} />
              </div>
              <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
              <Input label="Mobile Number" error={errors.mobileNumber?.message} required {...register('mobileNumber')} />
              <Input label="Alternate Mobile" {...register('alternateMobile')} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: d?.fullName },
                { label: 'Date of Birth', value: fullDriver?.dateOfBirth ? new Date(fullDriver.dateOfBirth).toLocaleDateString() : '—' },
                { label: 'Gender', value: fullDriver?.gender || '—' },
                { label: 'Mobile Number', value: d?.mobileNumber },
                { label: 'Alternate Mobile', value: fullDriver?.alternateMobile || '—' },
                { label: 'Email', value: fullDriver?.email || driver?.email || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-navy-700">{value || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-700">Driving &amp; Licence</h3>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : fullDriver?.drivingLicence ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Licence Number', value: fullDriver.drivingLicence.licenceNumber?.replace(/.(?=.{4})/g, '*') },
                { label: 'Licence Class', value: fullDriver.drivingLicence.licenceClass },
                { label: 'Issuing Authority', value: fullDriver.drivingLicence.issuingAuthority },
                { label: 'Issue Date', value: new Date(fullDriver.drivingLicence.issueDate).toLocaleDateString() },
                { label: 'Expiry Date', value: new Date(fullDriver.drivingLicence.expiryDate).toLocaleDateString() },
                { label: 'State of Issue', value: fullDriver.drivingLicence.stateOfIssue },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-navy-700">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No driving licence information added yet.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-700">Address Details</h3>
          </div>
          {fullDriver?.address ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Door / House Number', value: fullDriver.address.doorNumber },
                { label: 'Street', value: fullDriver.address.street },
                { label: 'Village / City', value: fullDriver.address.village },
                { label: 'District', value: fullDriver.address.district },
                { label: 'State', value: fullDriver.address.state },
                { label: 'PIN Code', value: fullDriver.address.pinCode },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-navy-700">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No address information added yet.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="font-semibold text-navy-700">Emergency Contact</h3>
          </div>
          {fullDriver?.emergencyContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Contact Name', value: fullDriver.emergencyContact.contactName },
                { label: 'Contact Number', value: fullDriver.emergencyContact.contactNumber },
                { label: 'Relationship', value: fullDriver.emergencyContact.relationship },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-navy-700">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No emergency contact added yet.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
