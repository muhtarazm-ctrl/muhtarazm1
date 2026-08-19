'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  X,
  Phone,
  Mail
} from 'lucide-react';
import { Profile } from '@/types/database';

interface StaffManagementProps {
  staffList: Profile[];
  onAddStaff: (staffData: Partial<Profile> & { password?: string }) => Promise<boolean>;
  onToggleStatus: (profileId: string, currentActive: boolean) => Promise<void>;
  onToggleViewAll: (profileId: string, currentViewAll: boolean) => Promise<void>;
  onDeleteStaff: (profileId: string) => Promise<void>;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staffList,
  onAddStaff,
  onToggleStatus,
  onToggleViewAll,
  onDeleteStaff
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [canViewAll, setCanViewAll] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alert('يرجى تعبئة الاسم، البريد الإلكتروني، وكلمة المرور.');
      return;
    }

    setIsSaving(true);
    const ok = await onAddStaff({
      full_name: fullName,
      email: email,
      phone: phone,
      role: 'employee',
      is_active: true,
      can_view_all_records: canViewAll,
      password: password
    });
    setIsSaving(false);

    if (ok) {
      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>لوحة تحكم المدير الحصرية</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            إدارة الموظفين والصلاحيات (5 موظفين)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            إضافة حسابات الموظفين، تحديد كلمات السر، والتحكم في إمكانية رؤية كافة العقود
          </p>
        </div>

        <button
          id="btn-open-add-staff"
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {staffList.map((staff, idx) => (
          <div
            key={staff.id}
            className="glass-panel glass-card-interactive"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderTop: `4px solid ${staff.role === 'admin' ? '#f59e0b' : '#0ea5e9'}`
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: staff.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: staff.role === 'admin' ? '#fbbf24' : '#38bdf8'
                }}>
                  {staff.role === 'admin' ? <ShieldCheck size={24} /> : <UserCheck size={24} />}
                </div>

                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    {staff.full_name}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: staff.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                      color: staff.role === 'admin' ? '#fbbf24' : '#38bdf8'
                    }}>
                      {staff.role === 'admin' ? 'المدير العام' : 'موظف تشغيلي'}
                    </span>

                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: staff.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: staff.is_active ? '#34d399' : '#f87171'
                    }}>
                      {staff.is_active ? 'حساب نشط' : 'حساب موقوف'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Staff button (only if not admin) */}
              {staff.role !== 'admin' && (
                <button
                  title="حذف الموظف"
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف الموظف (${staff.full_name})؟`)) {
                      onDeleteStaff(staff.id);
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

            {/* Contact info */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                <Mail size={14} color="#94a3b8" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                  <Phone size={14} color="#94a3b8" />
                  <span style={{ direction: 'ltr' }}>{staff.phone}</span>
                </div>
              )}
            </div>

            {/* Permissions & Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* Permission: View all records vs only own */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  رؤية جميع العقود والسجلات:
                </span>
                <button
                  onClick={() => onToggleViewAll(staff.id, staff.can_view_all_records)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: staff.can_view_all_records ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: staff.can_view_all_records ? '#34d399' : '#fbbf24'
                  }}
                >
                  {staff.can_view_all_records ? 'نعم (يرى الكل)' : 'فقط عقوده'}
                </button>
              </div>

              {/* Account Status Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  حالة الحساب:
                </span>
                <button
                  onClick={() => onToggleStatus(staff.id, staff.is_active)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: staff.is_active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: staff.is_active ? '#f87171' : '#34d399'
                  }}
                >
                  {staff.is_active ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>إضافة حساب موظف جديد</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  اسم الموظف الثلاثي:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: عبدالمجيد السالم"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  البريد الإلكتروني (لتسجيل الدخول):
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emp1@almuhtaraz.com"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  رقم الجوال:
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966550000000"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  كلمة المرور:
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="viewAllCheck"
                  checked={canViewAll}
                  onChange={(e) => setCanViewAll(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="viewAllCheck" style={{ fontSize: '0.85rem', color: '#e2e8f0', cursor: 'pointer' }}>
                  منح صلاحية رؤية جميع العقود للحاويات (بدلاً من عقوده فقط)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
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
                  disabled={isSaving}
                >
                  {isSaving ? 'جارٍ الإنشاء...' : 'حفظ الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
