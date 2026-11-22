import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { dashboardService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge, statusToBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
  User, FileText, Car, Bell, TrendingUp, CheckCircle,
  Clock, AlertTriangle, XCircle, ChevronRight, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

const VerificationIcon = ({ status }: { status: string }) => {
  if (status === 'APPROVED') return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === 'REJECTED') return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === 'UNDER_REVIEW') return <Clock className="w-4 h-4 text-blue-500" />;
  return <AlertTriangle className="w-4 h-4 text-amber-500" />;
};

const VerificationBanner = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string; border: string; icon: React.ReactNode; title: string; desc: string }> = {
    SUBMITTED: {
      bg: 'bg-amber-50', border: 'border-amber-200',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      title: 'Registration Submitted',
      desc: 'Your application has been received and is awaiting review. We will notify you once verified.',
    },
    UNDER_REVIEW: {
      bg: 'bg-blue-50', border: 'border-blue-200',
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      title: 'Under Review',
      desc: 'Our team is currently reviewing your documents. This typically takes 1–3 business days.',
    },
    APPROVED: {
      bg: 'bg-green-50', border: 'border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: 'Account Approved',
      desc: 'Congratulations! Your account is verified and you are ready to receive trip assignments.',
    },
    REJECTED: {
      bg: 'bg-red-50', border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      title: 'Application Rejected',
      desc: 'Your application was not approved. Please check your documents and resubmit.',
    },
    RESUBMISSION_REQUIRED: {
      bg: 'bg-orange-50', border: 'border-orange-200',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      title: 'Resubmission Required',
      desc: 'Some documents need to be resubmitted. Please check your document section.',
    },
  };
  const cfg = configs[status] || configs.SUBMITTED;
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border', cfg.bg, cfg.border)}>
      {cfg.icon}
      <div>
        <p className="font-semibold text-sm text-navy-700">{cfg.title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{cfg.desc}</p>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { driver } = useAuthStore();
  const navigate = useNavigate();

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardService.getOverview().then(r => r.data.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => dashboardService.getNotifications().then(r => r.data.data),
  });

  const driverData = overview?.driver || driver;
  const stats = overview?.stats || { totalDocuments: 0, totalVehicles: 0, profileCompletion: 0 };
  const recentNotifs: Array<{ id: string; title: string; message: string; isRead: boolean }> = notifications?.slice(0, 4) || [];

  const verificationItems = [
    { label: 'Personal Information', done: !!(driverData?.fullName && (driverData as any)?.dateOfBirth) },
    { label: 'Driving Licence', done: false },
    { label: 'Identity Documents', done: (stats.totalDocuments || 0) >= 3 },
    { label: 'Vehicle Documents', done: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700">
          Welcome Back, <span className="text-gradient-gold">{driverData?.fullName?.split(' ')[0] || 'Driver'}</span> 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here's an overview of your driver account.</p>
      </div>

      {(driverData as any)?.verificationStatus && (
        <VerificationBanner status={(driverData as any).verificationStatus} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Profile Complete', value: `${stats.profileCompletion}%`, icon: User, color: 'text-gold-600', bg: 'bg-gold-100' },
          { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Vehicles', value: stats.totalVehicles, icon: Car, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Notifications', value: recentNotifs.filter(n => !n.isRead).length, icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} padding="sm">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <div>
                <p className="text-xl font-bold text-navy-700">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gold-100 flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy-700 text-lg">{driverData?.fullName || '—'}</p>
                  <p className="text-sm text-slate-500">ID: {(driverData as any)?.registrationId || '—'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={statusToBadge((driverData as any)?.verificationStatus || '')}>
                      {(driverData as any)?.verificationStatus?.replace(/_/g, ' ') || 'Pending'}
                    </Badge>
                    <Badge variant="default">
                      {(driverData as any)?.registrationType === 'DRIVER_WITH_VEHICLE' ? 'Driver + Vehicle' : 'Driver Only'}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Completion</CardTitle>
                <span className="text-2xl font-bold text-gradient-gold">{stats.profileCompletion}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.profileCompletion}%`,
                    background: 'linear-gradient(90deg, #D99A19, #A96908)',
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Personal Info', done: !!driverData?.fullName },
                  { label: 'Address', done: false },
                  { label: 'Driving Licence', done: false },
                  { label: 'Profile Photo', done: !!(driverData as any)?.profilePhotoUrl },
                  { label: 'Documents', done: stats.totalDocuments >= 3 },
                  { label: 'Vehicle Info', done: stats.totalVehicles > 0 },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0', done ? 'bg-green-500' : 'bg-slate-200')}>
                      {done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={done ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
                  </div>
                ))}
              </div>
              {stats.profileCompletion < 100 && (
                <Button size="sm" className="w-full mt-4" onClick={() => navigate('/profile')}>
                  Complete Profile
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationItems.map(({ label, done }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <VerificationIcon status={done ? 'APPROVED' : 'SUBMITTED'} />
                      <span className="text-sm text-navy-700">{label}</span>
                    </div>
                    <Badge variant={done ? 'verified' : 'pending'}>{done ? 'Verified' : 'Pending'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Vehicle</CardTitle>
                {stats.totalVehicles === 0 && (driverData as any)?.registrationType === 'DRIVER_WITH_VEHICLE' && (
                  <Button size="sm" variant="outline" onClick={() => navigate('/vehicles')} className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {stats.totalVehicles === 0 ? (
                <div className="text-center py-6">
                  <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {(driverData as any)?.registrationType === 'DRIVER_WITH_VEHICLE'
                      ? 'No vehicle added yet'
                      : 'Registered as Driver Only'}
                  </p>
                </div>
              ) : (
                <button onClick={() => navigate('/vehicles')} className="w-full flex items-center justify-between hover:bg-gold-50/50 rounded-xl p-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                      <Car className="w-5 h-5 text-gold-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-navy-700">{stats.totalVehicles} Vehicle{stats.totalVehicles > 1 ? 's' : ''}</p>
                      <p className="text-xs text-slate-500">View details</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Notifications</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/notifications')}>View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentNotifs.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifs.map(notif => (
                    <div key={notif.id} className={cn('flex items-start gap-3 p-2 rounded-xl', !notif.isRead && 'bg-gold-50/50')}>
                      <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', notif.isRead ? 'bg-slate-300' : 'bg-gold-500')} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-navy-700 truncate">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trips &amp; Earnings</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No trips yet</p>
                <p className="text-xs text-slate-400 mt-1">Trips will appear here once you are assigned</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
