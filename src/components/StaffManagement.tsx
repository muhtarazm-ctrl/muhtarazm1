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
  ChevronDown,
  ChevronUp,
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
  can_view_financials: false, // Hidden for drivers
  can_create_contracts: false,
  can_extend_contracts: true, // Can extend on-site
  can_collect_payments: true, // Can collect COD cash
  can_send_payment_links: false,
  can_manage_inventory: true, // Can return container to stock
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
  const [isPermissionsDropdownOpenInAdd, setIsPermissionsDropdownOpenInAdd] = useState(true);
  const [newStaffPermissions, setNewStaffPermissions] = useState<StaffPermissions>(DEFAULT_STAFF_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table active dropdown popup ID for permissions
  const [openDropdownStaffId, setOpenDropdownStaffId] = useState<string | null>(null);

  const maxStaffLimit = 10;
  const currentCount = staffList.length;

  const handleTogglePermission = async (staff: Profile, key: keyof StaffPermissions) => {
    const currentPerms: StaffPermissions = staff.permissions || (
      staff.full_name.includes('سائق') ? DEFAULT_DRIVER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS
    );
    const updatedPerms: StaffPermissions = {
      ...currentPerms,
      [key]: !currentPerms[key]
    };
    await onUpdatePermissions(staff.id, updatedPerms);
  };

  const handleSubmitNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCount >= maxStaffLimit) {
      alert(`عذراً، تم الوصول للحد الأقصى لعدد المستخدمين (${maxStaffLimit}).`);
      return;
    }

    setIsSubmitting(true);
    const isDriver = jobRole === 'driver';
    const roleTitle = isDriver ? '(سائق رافعة وتوصيل)' : '(موظف استقبال ومتابعة)';
    const assignedPerms = isDriver ? DEFAULT_DRIVER_PERMISSIONS : newStaffPermissions;

    const success = await onAddStaff({
      full_name: `${fullName} ${roleTitle}`,
      email,
      phone,
      can_view_all_records: assignedPerms.can_view_all_contracts,
      permissions: assignedPerms
    });
    setIsSubmitting(false);

    if (success) {
      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('+9665');
      setJobRole('driver');
      setNewStaffPermissions(DEFAULT_STAFF_PERMISSIONS);
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
            إدارة الموظفين والصلاحيات المنسدلة
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            التحكم في صلاحيات الموظفين عبر القوائم المنسدلة الأنيقة، وتعيين السائقين الميدانيين تلقائياً
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setJobRole('driver');
            setIsAddModalOpen(true);
          }}
          disabled={currentCount >= maxStaffLimit}
          style={{ opacity: currentCount >= maxStaffLimit ? 0.6 : 1 }}
        >
          <UserPlus size={18} />
          <span>إضافة سائق أو موظف جديد</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="glass-panel" style={{ overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>الاسم والدور الوظيفي</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>رقم جوال الواتساب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>قائمة الصلاحيات المنسدلة 🛡️</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>حالة الحساب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => {
              const isDriver = staff.full_name.includes('سائق');
              const isAdmin = staff.role === 'admin';
              const perms: StaffPermissions = staff.permissions || (
                isDriver ? DEFAULT_DRIVER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS
              );
              const isDropdownOpen = openDropdownStaffId === staff.id;

              // Count active permissions
              const activePermsCount = Object.values(perms).filter(Boolean).length;

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

                  {/* Sleek Permissions Dropdown Menu */}
                  <td style={{ padding: '16px 20px', position: 'relative' }}>
                    {isAdmin ? (
                      <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 800 }}>
                        👑 صلاحيات كاملة غير محدودة
                      </span>
                    ) : (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        
                        {/* Dropdown Trigger Button */}
                        <button
                          onClick={() => setOpenDropdownStaffId(isDropdownOpen ? null : staff.id)}
                          style={{
                            background: isDropdownOpen ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                            border: `1px solid ${isDropdownOpen ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)'}`,
                            color: isDropdownOpen ? '#fbbf24' : '#e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Key size={14} color="#fbbf24" />
                          <span>قائمة الصلاحيات ({activePermsCount} مفعلة)</span>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: perms.can_view_financials ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: perms.can_view_financials ? '#34d399' : '#f87171'
                          }}>
                            {perms.can_view_financials ? '💰 المبالغ ظاهرة' : '🔒 المبالغ محجوبة'}
                          </span>
                          {isDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {/* Interactive Dropdown Checklist Box */}
                        {isDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            width: '320px',
                            background: '#0f172a',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            borderRadius: '12px',
                            padding: '14px',
                            zIndex: 100,
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>
                                تبديل الصلاحيات المباشر ⚡
                              </span>
                              <button
                                onClick={() => setOpenDropdownStaffId(null)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Option 1: Financials */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', background: perms.can_view_financials ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                              <span>💰 رؤية المبالغ والأسعار</span>
                              <input
                                type="checkbox"
                                checked={perms.can_view_financials}
                                onChange={() => handleTogglePermission(staff, 'can_view_financials')}
                                style={{ accentColor: '#10b981' }}
                              />
                            </label>

                            {/* Option 2: View All Contracts */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                              <span>🌐 رؤية كافة العقود</span>
                              <input
                                type="checkbox"
                                checked={perms.can_view_all_contracts}
                                onChange={() => handleTogglePermission(staff, 'can_view_all_contracts')}
                                style={{ accentColor: '#38bdf8' }}
                              />
                            </label>

                            {/* Option 3: Create Contracts */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                              <span>📝 إنشاء وتوثيق عقود</span>
                              <input
                                type="checkbox"
                                checked={perms.can_create_contracts}
                                onChange={() => handleTogglePermission(staff, 'can_create_contracts')}
                                style={{ accentColor: '#fbbf24' }}
                              />
                            </label>

                            {/* Option 4: Extend Contracts */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                              <span>🔄 تمديد وتأجيل السحب</span>
                              <input
                                type="checkbox"
                                checked={perms.can_extend_contracts}
                                onChange={() => handleTogglePermission(staff, 'can_extend_contracts')}
                                style={{ accentColor: '#38bdf8' }}
                              />
                            </label>

                            {/* Option 5: Collect Cash */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                              <span>💵 تحصيل كاش وسند قبض</span>
                              <input
                                type="checkbox"
                                checked={perms.can_collect_payments}
                                onChange={() => handleTogglePermission(staff, 'can_collect_payments')}
                                style={{ accentColor: '#10b981' }}
                              />
                            </label>

                            {/* Option 6: Send Sadad Links */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                              <span>💳 إرسال روابط سداد</span>
                              <input
                                type="checkbox"
                                checked={perms.can_send_payment_links}
                                onChange={() => handleTogglePermission(staff, 'can_send_payment_links')}
                                style={{ accentColor: '#fbbf24' }}
                              />
                            </label>

                            {/* Option 7: Return to Stock */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                              <span>📦 سحب واستلام للمخزون</span>
                              <input
                                type="checkbox"
                                checked={perms.can_manage_inventory}
                                onChange={() => handleTogglePermission(staff, 'can_manage_inventory')}
                                style={{ accentColor: '#10b981' }}
                              />
                            </label>

                          </div>
                        )}

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

      {/* Add Staff Modal (With Permissions Dropdown ONLY for Staff, Hidden for Driver) */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '28px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                  إضافة مستخدم جديد
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                  {jobRole === 'driver' ? 'تسجيل سائق ميداني وتعيين صلاحيات الرافعة والتوصيل تلقائياً' : 'تسجيل موظف استقبال وضبط صلاحياته عبر القائمة المنسدلة'}
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
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      (صلاحيات ميدانية تلقائية)
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
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      (صلاحيات قابلة للتخصيص)
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px', color: '#e2e8f0' }}>
                  اسم المستخدم:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={jobRole === 'driver' ? 'مثال: سعد الدوسري' : 'مثال: محمد الشمري'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px', color: '#10b981' }}>
                  رقم جوال الواتساب:
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
                  البريد الإلكتروني:
                </label>
                <input
                  type="email"
                  className="form-input"
                  dir="ltr"
                  placeholder={jobRole === 'driver' ? 'driver@almuhtaraz.com' : 'staff@almuhtaraz.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 🛡️ Permissions Dropdown (ONLY shown when jobRole === 'staff', HIDDEN for driver) */}
              {jobRole === 'staff' && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* Dropdown Header Trigger */}
                  <div
                    onClick={() => setIsPermissionsDropdownOpenInAdd(!isPermissionsDropdownOpenInAdd)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Key size={16} color="#38bdf8" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
                        قائمة صلاحيات موظف الاستقبال (تخصيص الصلاحيات) ▾
                      </span>
                    </div>
                    {isPermissionsDropdownOpenInAdd ? <ChevronUp size={16} color="#38bdf8" /> : <ChevronDown size={16} color="#38bdf8" />}
                  </div>

                  {/* Dropdown Content */}
                  {isPermissionsDropdownOpenInAdd && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_view_financials}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_view_financials: e.target.checked }))}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span>💰 رؤية المبالغ المالية</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_view_all_contracts}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_view_all_contracts: e.target.checked }))}
                          style={{ accentColor: '#38bdf8' }}
                        />
                        <span>🌐 رؤية كافة العقود</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_create_contracts}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_create_contracts: e.target.checked }))}
                          style={{ accentColor: '#fbbf24' }}
                        />
                        <span>📝 إنشاء وتوثيق عقود</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_extend_contracts}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_extend_contracts: e.target.checked }))}
                          style={{ accentColor: '#38bdf8' }}
                        />
                        <span>🔄 تمديد وتأجيل السحب</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_collect_payments}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_collect_payments: e.target.checked }))}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span>💵 تحصيل كاش وسند قبض</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_send_payment_links}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_send_payment_links: e.target.checked }))}
                          style={{ accentColor: '#fbbf24' }}
                        />
                        <span>💳 إرسال روابط سداد</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_manage_inventory}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_manage_inventory: e.target.checked }))}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span>📦 استلام للمخزون</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffffff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.can_send_whatsapp}
                          onChange={(e) => setNewStaffPermissions(p => ({ ...p, can_send_whatsapp: e.target.checked }))}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span>📱 مراسلة بالواتساب</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

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
                  {isSubmitting ? 'جارٍ الإضافة...' : 'حفظ وإضافة المستخدم'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
