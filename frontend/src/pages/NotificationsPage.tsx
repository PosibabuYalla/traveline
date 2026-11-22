import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { notificationService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import type { Notification } from '../types';

const TYPE_STYLES: Record<string, string> = {
  REGISTRATION: 'bg-gold-100 text-gold-700',
  DOCUMENT: 'bg-blue-100 text-blue-700',
  APPROVAL: 'bg-green-100 text-green-700',
  REJECTION: 'bg-red-100 text-red-700',
  VEHICLE: 'bg-purple-100 text-purple-700',
  PROFILE: 'bg-orange-100 text-orange-700',
  SYSTEM: 'bg-slate-100 text-slate-600',
};

export const NotificationsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll().then(r => r.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending} className="gap-2">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-16">
          <Bell className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No notifications yet</p>
          <p className="text-sm text-slate-400 mt-1">You will receive updates here about your registration and account</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} padding="sm" className={cn(!n.isRead && 'ring-1 ring-gold-200/60')}>
              <div className="flex items-start gap-4">
                <div className={cn('px-2 py-0.5 rounded-full text-xs font-medium shrink-0 mt-0.5', TYPE_STYLES[n.type] || TYPE_STYLES.SYSTEM)}>
                  {n.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold', n.isRead ? 'text-slate-600' : 'text-navy-700')}>{n.title}</p>
                    <span className="text-xs text-slate-400 shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markReadMutation.mutate(n.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-gold-50 text-gold-500" title="Mark as read">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
