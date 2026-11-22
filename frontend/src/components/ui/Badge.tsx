import { cn } from '../../lib/utils';

type BadgeVariant = 'pending' | 'verified' | 'review' | 'rejected' | 'approved' | 'expired' | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  verified: 'bg-green-100 text-green-700 border-green-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  review: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
  default: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const Badge = ({ variant = 'default', className, children }: { variant?: BadgeVariant; className?: string; children: React.ReactNode }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variantStyles[variant], className)}>
    {children}
  </span>
);

export const statusToBadge = (status: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    SUBMITTED: 'pending', UNDER_REVIEW: 'review', APPROVED: 'approved',
    REJECTED: 'rejected', RESUBMISSION_REQUIRED: 'rejected',
    PENDING: 'pending', VERIFIED: 'verified', EXPIRED: 'expired',
  };
  return map[status] || 'default';
};
