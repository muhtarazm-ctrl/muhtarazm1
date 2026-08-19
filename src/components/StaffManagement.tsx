'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Trash2, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Truck,
  Briefcase,
  DollarSign,
  FileText,
  RotateCw,
  CreditCard,
  Package,
  MessageSquare,
  Lock,
  Unlock,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { Profile, StaffPermissions, UserRole } from '@/types/database';

interface StaffManagementProps {
  staffList: Profile[];
  onAddStaff: (staffData: any) => Promise<boolean>;
  onToggleStatus: (profileId: string, currentActive: boolean) => Promise<void>;
  onUpdatePermissions: (profileId: string, permissions: StaffPermissions) => Promise<void>;
  onDeleteStaff: (profileId: string) => Promise<void>;
}

// Default permissions for new driver vs staff
export const DEFAULT_DRIVER_PERMISSIONS: StaffPermissions = {
  can_view_all_contracts: false,
  can_view_financials: false, // Hidden by default for field drivers
  can_create_contracts: false,
  can_extend_contracts: true, // Can extend on-site
  can_collect_payments: true, // Can collect COD cash & issue receipt
  can_send_payment_links: false,
  can_manage_inventory: true, // Can return container to stock on pickup
  can_send_whatsapp: true
};

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  can_view_all_contracts: true,
  can_view_financials: true,
  can_create_contracts: true,
  can_extend_contracts: true,
  can_collect_payments: true,
  can_send_payment_links: true,
  can_manage_inventory: true,
  can_send_whatsapp: true
};

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staffList,
  onAddStaff,
  onToggleStatus,
  onUpdatePermissions,
  onDeleteStaff
}) => {
  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+9665');
  const [jobRole, setJobRole] = useState<'driver' | 'staff'>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Permissions Modal State
  const [selectedStaffForPerms, setSelectedStaffForPerms] = useState<Profile | null>(null);
  const [tempPermissions, setTempPermissions] = useState<StaffPermissions>(DEFAULT_DRIVER_PERMISSIONS);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  const maxStaffLimit = 10;
  const currentCount = staffList.length;

  const handleOpenPermsModal = (staff: Profile) => {
    setSelectedStaffForPerms(staff);
    const existingPerms: StaffPermissions = staff.permissions || (
      staff.full_name.includes('سائق') ? { ...DEFAULT_DRIVER_PERMISSIONS, can_view_all_contracts: staff.can_view_all_records } : { ...DEFAULT_STAFF_PERMISSIONS, can_view_all_contracts: staff.can_view_all_records }
    );
    setTempPermissions(existingPerms);
  };

  const handleSavePermsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPerms) return;
    setIsSavingPerms(true);
    await onUpdatePermissions(selectedStaffForPerms.id, tempPermissions);
    setIsSavingPerms(false);
    setSelectedStaffForPerms(null);
  };

  const handleSubmitNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCount >= maxStaffLimit) {
      alert(`عذراً، تم الوصول للحد الأقصى لعدد المستخدمين (${maxStaffLimit}).`);
      return;
    }

    setIsSubmitting(true);
    const roleTitle = jobRole === 'driver' ? '(سائق رافعة وتوصيل)' : '(موظف استقبال ومتابعة)';
    const initialPerms = jobRole === 'driver' ? DEFAULT_DRIVER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS;

    const success = await onAddStaff({
      full_name: `${fullName} ${roleTitle}`,
      email,
      phone,
      can_view_all_records: initialPerms.can_view_all_contracts,
      permissions: initialPerms
    });
    setIsSubmitting(false);

    if (success) {
      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('+9665');
      setJobRole('driver');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>خاص بالمدير العام</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            إدارة الموظفين ومصفوفة الصلاحيات الميدانية
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            التحكم الشامل في صلاحيات كل موظف وسائق (رؤية المبالغ، إنشاء العقود، التمديد، تحصيل الكاش، وإدارة المخزون)
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          disabled={currentCount >= maxStaffLimit}
          style={{ opacity: currentCount >= maxStaffLimit ? 0.6 : 1 }}
        >
          <UserPlus size={18} />
          <span>إضافة سائق أو موظف جديد</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>الاسم والدور الوظيفي</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>رقم جوال الواتساب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>مصفوفة الصلاحيات الممنوحة 🛡️</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>حالة الحساب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => {
              const isDriver = staff.full_name.includes('سائق');
              const isAdmin = staff.role === 'admin';
              const perms: StaffPermissions = staff.permissions || (
                isDriver ? { ...DEFAULT_DRIVER_PERMISSIONS, can_view_all_contracts: staff.can_view_all_records } : { ...DEFAULT_STAFF_PERMISSIONS, can_view_all_contracts: staff.can_view_all_records }
              );

              return (
                <tr 
                  key={staff.id}
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: staff.role === 'admin' ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                  }}
                >
                  {/* Name and Role */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isAdmin ? 'rgba(245, 158, 11, 0.2)' : isDriver ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isAdmin ? <ShieldCheck size={20} color="#fbbf24" /> : isDriver ? <Truck size={20} color="#34d399" /> : <Briefcase size={20} color="#38bdf8" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                          {staff.full_name}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '1px 8px',
                          borderRadius: '4px',
                          marginTop: '2px',
                          background: isAdmin ? '#f59e0b' : isDriver ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: isAdmin ? '#050811' : isDriver ? '#34d399' : '#38bdf8',
                          border: `1px solid ${isAdmin ? 'transparent' : isDriver ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                        }}>
                          {isAdmin ? '👑 المدير العام' : isDriver ? '🚛 سائق رافعة وتوصيل' : '👷 موظف استقبال ومتابعة'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td style={{ padding: '16px 20px', direction: 'ltr', textAlign: 'right' }}>
                    <span style={{ color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 600 }}>
                      {staff.phone || staff.email}
                    </span>
                  </td>

                  {/* Permissions Summary Badges & Edit Button */}
                  <td style={{ padding: '16px 20px' }}>
                    {isAdmin ? (
                      <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 800 }}>
                        👑 صلاحيات كاملة غير محدودة (مدير النظام)
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        
                        {/* Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          
                          {/* Financials */}
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: perms.can_view_financials ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: perms.can_view_financials ? '#34d399' : '#f87171',
                            border: `1px solid ${perms.can_view_financials ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }} title="رؤية المبالغ والأسعار">
                            {perms.can_view_financials ? '💰 المبالغ ظاهرة' : '🔒 المبالغ محجوبة'}
                          </span>

                          {/* Create Contracts */}
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: perms.can_create_contracts ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: perms.can_create_contracts ? '#38bdf8' : '#94a3b8'
                          }} title="إنشاء وتوثيق عقود جديدة">
                            📝 {perms.can_create_contracts ? 'إنشاء عقود' : 'حظر الإنشاء'}
                          </span>

                          {/* Collect Cash */}
                          {perms.can_collect_payments && (
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24'
                            }} title="تحصيل كاش وإصدار سند قبض">
                              💵 تحصيل وسند
                            </span>
                          )}

                          {/* Scope */}
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: perms.can_view_all_contracts ? '#e2e8f0' : '#a5b4fc'
                          }}>
                            {perms.can_view_all_contracts ? '🌐 كل العقود' : '👤 عقوده فقط'}
                          </span>

                        </div>

                        {/* Edit Permissions Button */}
                        <button
                          onClick={() => handleOpenPermsModal(staff)}
                          style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            color: '#fbbf24',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Key size={12} />
                          <span>تعديل الصلاحيات</span>
                        </button>

                      </div>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td style={{ padding: '16px 20px' }}>
                    {staff.role === 'admin' ? (
                      <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>نشط دائماً</span>
                    ) : (
                      <button
                        onClick={() => onToggleStatus(staff.id, staff.is_active)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: staff.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: staff.is_active ? '#34d399' : '#f87171'
                        }}
                      >
                        {staff.is_active ? 'نشط 🟢' : 'موقوف 🔴'}
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {staff.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${staff.full_name}؟`)) {
                            onDeleteStaff(staff.id);
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="حذف الحساب"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Permissions Configuration Modal */}
      {selectedStaffForPerms && (
        <div className="modal-backdrop" onClick={() => setSelectedStaffForPerms(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', padding: '28px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={22} color="#fbbf24" />
                  <span>ضبط صلاحيات: {selectedStaffForPerms.full_name}</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                  حدد بدقة ما يحق للموظف رؤيته أو تعديله أو تنفيذه في النظام
                </p>
              </div>

              <button
                onClick={() => setSelectedStaffForPerms(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
                ⚡ قوالب جاهزة سريعة:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTempPermissions(DEFAULT_DRIVER_PERMISSIONS)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🚛 قالب السائق الميداني
                </button>
                <button
                  type="button"
                  onClick={() => setTempPermissions(DEFAULT_STAFF_PERMISSIONS)}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  👷 قالب موظف الاستقبال
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePermsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 1. View Financials */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: tempPermissions.can_view_financials ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${tempPermissions.can_view_financials ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_view_financials}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_view_financials: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#10b981' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: tempPermissions.can_view_financials ? '#34d399' : '#f87171' }}>
                    💰 رؤية المبالغ المالية والأسعار وإجمالي العقود (Financials Visibility)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    {tempPermissions.can_view_financials ? 'الموظف يرى إجمالي المبالغ والمدفوع والمتبقي في كل الشاشات.' : '🔒 يتم حجب المبالغ المالية من الموظف وتظهر مشفرة [*** ر.س] لحماية الخصوصية المالية.'}
                  </div>
                </div>
              </label>

              {/* 2. View All Contracts vs Assigned */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_view_all_contracts}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_view_all_contracts: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#38bdf8' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    🌐 رؤية كافة العقود في النظام (View All Contracts)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    {tempPermissions.can_view_all_contracts ? 'يرى جميع عقود الشركة لكافة السائقين.' : '👤 يرى فقط العقود المسندة إليه شخصياً.'}
                  </div>
                </div>
              </label>

              {/* 3. Create Contracts */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_create_contracts}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_create_contracts: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#fbbf24' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    📝 إنشاء وتوثيق عقود جديدة (Create New Contracts)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    إمكانية حجز وتأجير الحاويات المتاحة وتوثيق العقد.
                  </div>
                </div>
              </label>

              {/* 4. Extend Contracts */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_extend_contracts}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_extend_contracts: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#38bdf8' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    🔄 تمديد وتجديد العقود (Extend & Renew Contracts)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    تأجيل موعد سحب الحاوية وإضافة أيام إضافية وتحديث العقد.
                  </div>
                </div>
              </label>

              {/* 5. Collect Payments & Issue Receipt */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_collect_payments}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_collect_payments: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#10b981' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    💵 تحصيل الكاش الميداني وإصدار سندات القبض (Cash Collection)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    استلام المبالغ نقداً في الموقع وطباعة/إرسال سند القبض المعتمد.
                  </div>
                </div>
              </label>

              {/* 6. Send Sadad Links */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_send_payment_links}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_send_payment_links: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#fbbf24' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    💳 إرسال روابط سداد الإلكترونية (Send Payment Links)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    توليد وإرسال روابط فواتير مدى وأبل باي عبر محرك الواتساب.
                  </div>
                </div>
              </label>

              {/* 7. Manage Inventory / Return to stock */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tempPermissions.can_manage_inventory}
                  onChange={(e) => setTempPermissions(p => ({ ...p, can_manage_inventory: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#10b981' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    📦 سحب واستلام الحاويات للمخزون (Return to Stock)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    إنهاء العقد وسحب الحاوية وإرجاعها فوراً لقائمة المتاح 🟢.
                  </div>
                </div>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedStaffForPerms(null)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSavingPerms}
                  style={{ minWidth: '160px' }}
                >
                  {isSavingPerms ? 'جارٍ الحفظ...' : 'حفظ الصلاحيات'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '28px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                  إضافة سائق أو موظف جديد
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                  تسجيل حساب جديد وتعيين الصلاحيات الافتراضية
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Role Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#fbbf24' }}>
                  نوع المهمة / الدور:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    onClick={() => setJobRole('driver')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: `2px solid ${jobRole === 'driver' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: jobRole === 'driver' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Truck size={20} color={jobRole === 'driver' ? '#34d399' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: jobRole === 'driver' ? '#34d399' : '#ffffff' }}>
                      سائق رافعة وتوصيل 🚛
                    </div>
                  </div>

                  <div
                    onClick={() => setJobRole('staff')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: `2px solid ${jobRole === 'staff' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: jobRole === 'staff' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Briefcase size={20} color={jobRole === 'staff' ? '#38bdf8' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: jobRole === 'staff' ? '#38bdf8' : '#ffffff' }}>
                      موظف استقبال ومتابعة 👷
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px', color: '#e2e8f0' }}>
                  اسم الموظف / السائق:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: محمد العمري"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px', color: '#10b981' }}>
                  رقم جوال الواتساب (مباشر للميدان):
                </label>
                <input
                  type="tel"
                  className="form-input"
                  dir="ltr"
                  placeholder="+9665XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px', color: '#e2e8f0' }}>
                  البريد الإلكتروني (لتسجيل الدخول):
                </label>
                <input
                  type="email"
                  className="form-input"
                  dir="ltr"
                  placeholder="driver@almuhtaraz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جارٍ الإضافة...' : 'حفظ وإضافة الموظف'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
