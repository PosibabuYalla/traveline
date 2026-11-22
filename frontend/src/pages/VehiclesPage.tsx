import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge, statusToBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { vehicleService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import type { Vehicle } from '../types';

const schema = z.object({
  category: z.string().min(1, 'Category required'),
  manufacturer: z.string().min(1, 'Manufacturer required'),
  model: z.string().min(1, 'Model required'),
  registrationNumber: z.string().min(4, 'Registration number required'),
  manufacturingYear: z.coerce.number().min(2000).max(new Date().getFullYear()),
  seatingCapacity: z.coerce.number().min(2).max(60),
  fuelType: z.string().min(1, 'Fuel type required'),
  colour: z.string().min(1, 'Colour required'),
  hasAC: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const VEHICLE_CATEGORIES = [
  { value: 'SEDAN', label: 'Sedan' }, { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'Hatchback' }, { value: 'TEMPO', label: 'Tempo Traveller' },
  { value: 'BUS', label: 'Mini Bus' }, { value: 'LUXURY', label: 'Luxury Vehicle' },
];

const FUEL_TYPES = [
  { value: 'PETROL', label: 'Petrol' }, { value: 'DIESEL', label: 'Diesel' },
  { value: 'CNG', label: 'CNG' }, { value: 'ELECTRIC', label: 'Electric' }, { value: 'HYBRID', label: 'Hybrid' },
];

interface VehicleFormProps {
  reg: ReturnType<typeof useForm<FormData>>['register'];
  errs: ReturnType<typeof useForm<FormData>>['formState']['errors'];
}

const VehicleFormFields = ({ reg, errs }: VehicleFormProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Select label="Category" placeholder="Select" required options={VEHICLE_CATEGORIES} error={errs.category?.message} {...reg('category')} />
    <Input label="Manufacturer" placeholder="Toyota, Maruti..." error={errs.manufacturer?.message} required {...reg('manufacturer')} />
    <Input label="Model" placeholder="Innova, Swift..." error={errs.model?.message} required {...reg('model')} />
    <Input label="Registration Number" placeholder="TN 01 AB 1234" error={errs.registrationNumber?.message} required {...reg('registrationNumber')} />
    <Input label="Manufacturing Year" type="number" error={errs.manufacturingYear?.message} required {...reg('manufacturingYear')} />
    <Input label="Seating Capacity" type="number" error={errs.seatingCapacity?.message} required {...reg('seatingCapacity')} />
    <Select label="Fuel Type" placeholder="Select" required options={FUEL_TYPES} error={errs.fuelType?.message} {...reg('fuelType')} />
    <Input label="Colour" placeholder="White, Silver..." error={errs.colour?.message} required {...reg('colour')} />
    <div className="flex items-center gap-3 mt-2">
      <input type="checkbox" id="ac" {...reg('hasAC')} className="w-4 h-4 rounded border-slate-300 text-gold-500 focus:ring-gold-500/30" />
      <label htmlFor="ac" className="text-sm font-medium text-navy-600">Air Conditioned (AC)</label>
    </div>
  </div>
);

export const VehiclesPage = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['my-vehicles'],
    queryFn: () => vehicleService.getAll().then(r => r.data.data),
  });

  const addForm = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { hasAC: false, manufacturingYear: new Date().getFullYear(), seatingCapacity: 4 },
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
      setAddOpen(false);
      addForm.reset();
      toast.success('Vehicle added successfully');
    },
    onError: () => toast.error('Failed to add vehicle'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => vehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
      setEditTarget(null);
      toast.success('Vehicle updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
      setDeleteTarget(null);
      toast.success('Vehicle deleted');
    },
    onError: () => toast.error('Delete failed'),
  });

  const openEdit = (v: Vehicle) => {
    setEditTarget(v);
    editForm.reset({ ...v });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">My Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your registered vehicles</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <Card className="text-center py-16">
          <Car className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No vehicles registered yet</p>
          <Button className="mt-4 gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Your First Vehicle
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => (
            <Card key={v.id} padding="sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-navy-700">{v.manufacturer} {v.model}</p>
                      <p className="text-sm text-slate-500">{v.registrationNumber} · {v.category}</p>
                    </div>
                    <Badge variant={statusToBadge(v.verificationStatus)}>{v.verificationStatus.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    <span>{v.manufacturingYear}</span>
                    <span>{v.seatingCapacity} Seats</span>
                    <span>{v.fuelType}</span>
                    <span>{v.colour}</span>
                    {v.hasAC && <span className="text-green-600 font-medium">AC</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gold-50 text-gold-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === v.id && (
                <div className="mt-4 pt-4 border-t border-white/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    { label: 'Category', value: v.category },
                    { label: 'Year', value: String(v.manufacturingYear) },
                    { label: 'Seats', value: String(v.seatingCapacity) },
                    { label: 'Fuel', value: v.fuelType },
                    { label: 'Colour', value: v.colour },
                    { label: 'AC', value: v.hasAC ? 'Yes' : 'No' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-medium text-navy-700">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Vehicle" size="lg">
        <form onSubmit={addForm.handleSubmit((d) => createMutation.mutate(d as FormData))}>
          <VehicleFormFields reg={addForm.register} errs={addForm.formState.errors} />
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>Add Vehicle</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Vehicle" size="lg">
        <form onSubmit={editForm.handleSubmit((d) => editTarget && updateMutation.mutate({ id: editTarget.id, data: d as FormData }))}>
          <VehicleFormFields reg={editForm.register} errs={editForm.formState.errors} />
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Vehicle">
        <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};
