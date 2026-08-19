'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Filter, 
  Wrench, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Edit3,
  X
} from 'lucide-react';
import { Container, ContainerStatus, ContainerType, UserRole } from '@/types/database';

interface ContainersViewProps {
  containers: Container[];
  userRole: UserRole;
  onUpdateStatus: (containerId: string, status: ContainerStatus) => Promise<void>;
  onAddContainer: (containerData: Partial<Container>) => Promise<boolean>;
  onDeleteContainer: (containerId: string) => Promise<void>;
  onOpenRentModal: (containerId: string) => void;
}

export const ContainersView: React.FC<ContainersViewProps> = ({
  containers,
  userRole,
  onUpdateStatus,
  onAddContainer,
  onDeleteContainer,
  onOpenRentModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'commercial' | 'debris'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ContainerStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Add container form state
  const [newNum, setNewNum] = useState('');
  const [newType, setNewType] = useState<ContainerType>('debris');
  const [newDailyRate, setNewDailyRate] = useState(150);
  const [newMonthlyRate, setNewMonthlyRate] = useState(3500);
  const [newNotes, setNewNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredContainers = containers.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNum.trim()) {
      alert('يرجى كتابة رقم الحاوية.');
      return;
    }
    setIsSaving(true);
    const ok = await onAddContainer({
      container_number: newNum.trim().toUpperCase(),
      type: newType,
      status: 'available',
      daily_rate: newType === 'debris' ? newDailyRate : 0,
      monthly_rate: newType === 'commercial' ? newMonthlyRate : 0,
      notes: newNotes
    });
    setIsSaving(false);
    if (ok) {
      setIsAddModalOpen(false);
      setNewNum('');
      setNewNotes('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            أسطول وإدارة الحاويات
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            متابعة فورية لحالة الحاويات التجارية وحاويات الأنقاض وأسعار التأجير
          </p>
        </div>

        <button
          id="btn-open-add-container"
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>إضافة حاوية جديدة</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="glass-panel" style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>النوع:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'commercial', label: 'حاويات تجارية' },
            { id: 'debris', label: 'حاويات أنقاض' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id as any)}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterType === t.id ? 'var(--accent-gold)' : 'transparent',
                background: filterType === t.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: filterType === t.id ? '#fbbf24' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>الحالة:</span>
          {[
            { id: 'all', label: 'جميع الحالات' },
            { id: 'available', label: 'متاحة' },
            { id: 'rented', label: 'مؤجرة' },
            { id: 'maintenance', label: 'صيانة' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id as any)}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterStatus === s.id ? '#38bdf8' : 'transparent',
                background: filterStatus === s.id ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: filterStatus === s.id ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Containers Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredContainers.map(container => (
          <div 
            key={container.id} 
            className="glass-panel glass-card-interactive" 
            style={{ 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              borderTop: `4px solid ${
                container.status === 'available' ? '#10b981' :
                container.status === 'rented' ? '#0ea5e9' : '#f59e0b'
              }`
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: container.type === 'commercial' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${container.type === 'commercial' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                }}>
                  <Truck size={24} color={container.type === 'commercial' ? '#a5b4fc' : '#fbbf24'} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                    حاوية {container.container_number}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span className={`badge ${container.type === 'commercial' ? 'badge-commercial' : 'badge-debris'}`}>
                      {container.type === 'commercial' ? 'تجاري' : 'أنقاض'}
                    </span>
                    <span className={`badge ${
                      container.status === 'available' ? 'badge-available' :
                      container.status === 'rented' ? 'badge-rented' : 'badge-maintenance'
                    }`}>
                      {container.status === 'available' ? 'متاحة للتأجير' :
                       container.status === 'rented' ? 'مؤجرة حالياً' : 'تحت الصيانة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin delete button */}
              {userRole === 'admin' && (
                <button
                  title="حذف الحاوية (خاص بالمدير)"
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من رغبتك بحذف الحاوية (${container.container_number})؟`)) {
                      onDeleteContainer(container.id);
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* Notes */}
            {container.notes && (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(0, 0, 0, 0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                {container.notes}
              </div>
            )}

            {/* Rates */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.9rem',
              color: '#e2e8f0',
              padding: '8px 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {container.type === 'debris' ? (
                <div>
                  <span style={{ color: '#94a3b8' }}>سعر اليومي:</span> <strong>{container.daily_rate || 150} ر.س</strong>
                </div>
              ) : (
                <div>
                  <span style={{ color: '#94a3b8' }}>سعر الشهري:</span> <strong>{container.monthly_rate || 3500} ر.س</strong>
                </div>
              )}

              {/* Status Selector Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>الحالة:</span>
                <select
                  value={container.status}
                  onChange={(e) => onUpdateStatus(container.id, e.target.value as ContainerStatus)}
                  style={{
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.8rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="available">متاحة</option>
                  <option value="rented">مؤجرة</option>
                  <option value="maintenance">صيانة</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {container.status === 'available' && (
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%' }}
                  onClick={() => onOpenRentModal(container.id)}
                >
                  <Plus size={15} />
                  <span>تأجير الحاوية الآن</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Container Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>إضافة حاوية جديدة</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  رقم الحاوية الفريد:
                </label>
                <input
                  id="new-container-number-input"
                  type="text"
                  className="form-input"
                  value={newNum}
                  onChange={(e) => setNewNum(e.target.value)}
                  placeholder="مثال: C-105 أو D-205"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  نوع الحاوية (نوعان فقط):
                </label>
                <select
                  className="form-select"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ContainerType)}
                >
                  <option value="debris">حاوية أنقاض (عقود يومية)</option>
                  <option value="commercial">حاوية تجارية (عقود شهرية / سنوية)</option>
                </select>
              </div>

              {newType === 'debris' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                    سعر التأجير اليومي (ر.س):
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                    سعر التأجير الشهري (ر.س):
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={newMonthlyRate}
                    onChange={(e) => setNewMonthlyRate(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  ملاحظات أو مواصفات:
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ملاحظات حول حالة الحاوية أو موقعها الثابت..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  إلغاء
                </button>
                <button
                  id="confirm-add-container-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'جارٍ الإضافة...' : 'حفظ الحاوية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
