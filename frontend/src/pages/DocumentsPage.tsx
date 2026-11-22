import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Eye, Trash2, RefreshCw, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, statusToBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { documentService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import type { DriverDocument } from '../types';

const DOC_LABELS: Record<string, string> = {
  AADHAAR_CARD: 'Aadhaar Card',
  DRIVING_LICENCE_FRONT: 'Driving Licence (Front)',
  DRIVING_LICENCE_BACK: 'Driving Licence (Back)',
  PROFILE_PHOTO: 'Profile Photograph',
  ADDRESS_PROOF: 'Address Proof',
  PAN_CARD: 'PAN Card',
};

export const DocumentsPage = () => {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<DriverDocument[]>({
    queryKey: ['my-documents'],
    queryFn: () => documentService.getMyDocuments().then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      setDeleteTarget(null);
      toast.success('Document deleted');
    },
    onError: () => toast.error('Delete failed', 'Please try again'),
  });

  const handleResubmit = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png,.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const form = new FormData();
        form.append('document', file);
        await documentService.resubmit(id, form);
        queryClient.invalidateQueries({ queryKey: ['my-documents'] });
        toast.success('Document resubmitted');
      } catch {
        toast.error('Resubmit failed', 'Please try again');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700">My Documents</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track your uploaded documents</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Loading documents...</div>
      ) : documents.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No documents uploaded yet</p>
          <p className="text-sm text-slate-400 mt-1">Complete your registration to upload documents</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} padding="sm">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  doc.verificationStatus === 'VERIFIED' ? 'bg-green-100' :
                  doc.verificationStatus === 'REJECTED' ? 'bg-red-100' : 'bg-gold-100')}>
                  <FileText className={cn('w-5 h-5',
                    doc.verificationStatus === 'VERIFIED' ? 'text-green-600' :
                    doc.verificationStatus === 'REJECTED' ? 'text-red-600' : 'text-gold-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-700 truncate">
                    {DOC_LABELS[doc.documentType] || doc.documentType}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <Badge variant={statusToBadge(doc.verificationStatus)}>
                  {doc.verificationStatus.replace(/_/g, ' ')}
                </Badge>
                {doc.expiryDate && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {doc.rejectionReason && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg p-2 mb-3">
                  Rejection reason: {doc.rejectionReason}
                </p>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1 gap-1"
                  onClick={() => window.open((doc as any).fileUrl || '#', '_blank')}>
                  <Eye className="w-3.5 h-3.5" /> View
                </Button>
                {(doc.verificationStatus === 'REJECTED' || doc.verificationStatus === 'RESUBMISSION_REQUIRED') && (
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleResubmit(doc.id)}>
                    <RefreshCw className="w-3.5 h-3.5" /> Resubmit
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(doc.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Document">
        <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this document? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
