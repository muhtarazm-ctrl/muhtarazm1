'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  MapPin, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  Calendar,
  AlertTriangle,
  Trash2,
  Phone,
  DollarSign
} from 'lucide-react';
import { Contract, ContractStatus, UserRole } from '@/types/database';

interface ContractsViewProps {
  contracts: Contract[];
  userRole: UserRole;
  onUpdateContractStatus: (contractId: string, status: ContractStatus) => Promise<void>;
  onDeleteContract: (contractId: string) => Promise<void>;
  onSendWhatsApp: (phone: string, message: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  userRole,
  onUpdateContractStatus,
  onDeleteContract,
  onSendWhatsApp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'commercial' | 'debris'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ContractStatus>('all');

  const filteredContracts = contracts.filter(c => {
    if (filterType !== 'all' && c.contract_type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (!searchTerm.trim()) return true;
    
    const q = searchTerm.toLowerCase();
    return (
      c.contract_number.toLowerCase().includes(q) ||
      (c.customer?.name && c.customer.name.toLowerCase().includes(q)) ||
      (c.customer?.phone && c.customer.phone.includes(q)) ||
      (c.container?.container_number && c.container.container_number.toLowerCase().includes(q))
    );
  });

  const calculateRemainingTimeText = (contract: Contract) => {
    const end = new Date(contract.expected_pickup_time || contract.end_date);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (contract.status === 'completed') {
      return { text: 'مكتمل ومستلم', color: '#34d399', isUrgent: false };
    }
    
    if (diffMs < 0) {
      return { text: 'منتهي الصلاحية (مستحق السحب/التجديد)', color: '#f87171', isUrgent: true };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours <= 6) {
      return { text: `متبقي ${diffHours} ساعة فقط على موعد السحب`, color: '#f59e0b', isUrgent: true };
    }
    if (diffDays === 0) {
      return { text: `ينتهي اليوم (متبقي ${diffHours} ساعة)`, color: '#fbbf24', isUrgent: true };
    }
    if (diffDays <= 7) {
      return { text: `متبقي ${diffDays} أيام على التجديد`, color: '#a5b4fc', isUrgent: false };
    }
    return { text: `متبقي ${diffDays} يوماً`, color: '#94a3b8', isUrgent: false };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            سجل العقود والتأجير
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            متابعة العقود النشطة، مواعيد السحب والتجديد، وحالات الدفع
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="#fbbf24" />
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم العقد، اسم العميل، الجوال، أو رقم الحاوية..."
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'كل العقود' },
            { id: 'debris', label: 'أنقاض (يومي)' },
            { id: 'commercial', label: 'تجاري' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterType === f.id ? 'var(--accent-gold)' : 'transparent',
                background: filterType === f.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: filterType === f.id ? '#fbbf24' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {filteredContracts.map(contract => {
          const timing = calculateRemainingTimeText(contract);

          return (
            <div 
              key={contract.id} 
              className="glass-panel glass-card-interactive"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderRight: `4px solid ${contract.contract_type === 'commercial' ? '#6366f1' : '#f59e0b'}`
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fbbf24' }}>
                      عقد #{contract.contract_number}
                    </span>
                    <span className={`badge ${contract.contract_type === 'commercial' ? 'badge-commercial' : 'badge-debris'}`}>
                      {contract.contract_type === 'commercial' ? 'تجاري' : 'أنقاض (يومي)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                    حاوية: <strong style={{ color: '#ffffff' }}>{contract.container?.container_number || 'غير مسندة'}</strong>
                  </div>
                </div>

                {/* Admin Delete */}
                {userRole === 'admin' && (
                  <button
                    title="حذف العقد (خاص بالمدير)"
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف العقد #${contract.contract_number}؟`)) {
                        onDeleteContract(contract.id);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      borderRadius: '8px',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Customer */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                    {contract.customer?.name || 'العميل'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', direction: 'ltr', textAlign: 'right' }}>
                    {contract.customer?.phone}
                  </div>
                </div>

                {contract.customer?.phone && (
                  <button
                    className="btn-emerald"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => onSendWhatsApp(
                      contract.customer!.phone,
                      `مرحباً ${contract.customer?.name}، نود تذكيركم بخصوص عقد الحاوية رقم (${contract.contract_number}) لدى المحترز للحاويات.`
                    )}
                  >
                    <MessageCircle size={14} />
                    <span>مراسلة</span>
                  </button>
                )}
              </div>

              {/* Countdown & Timing Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: timing.color,
                background: timing.isUrgent ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: timing.isUrgent ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <Clock size={15} />
                <span style={{ fontWeight: 600 }}>{timing.text}</span>
              </div>

              {/* Location Google Maps */}
              {contract.google_maps_url ? (
                <a
                  href={contract.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#38bdf8',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    background: 'rgba(14, 165, 233, 0.08)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(14, 165, 233, 0.2)'
                  }}
                >
                  <MapPin size={15} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contract.location_address || 'فتح الموقع على خرائط Google'}
                  </span>
                  <ExternalLink size={13} />
                </a>
              ) : contract.location_address ? (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  <span>{contract.location_address}</span>
                </div>
              ) : null}

              {/* Cost & Payment Details */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>التكلفة:</span> <strong>{contract.total_cost} ر.س</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>المتبقي:</span>{' '}
                  <strong style={{ color: (contract.total_cost - contract.paid_amount) > 0 ? '#f87171' : '#34d399' }}>
                    {(contract.total_cost - contract.paid_amount)} ر.س
                  </strong>
                </div>

                {/* Status Switcher */}
                <select
                  value={contract.status}
                  onChange={(e) => onUpdateContractStatus(contract.id, e.target.value as ContractStatus)}
                  style={{
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="active">نشط</option>
                  <option value="completed">مكتمل ومستلم</option>
                  <option value="extended">ممدد</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

            </div>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <FileText size={40} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '4px' }}>لا توجد عقود مسجلة بهذا الفلتر</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>يمكنك إضافة عقد جديد بضغطة زر من الأعلى.</p>
        </div>
      )}
    </div>
  );
};
