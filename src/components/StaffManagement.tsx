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
  Briefcase
} from 'lucide-react';
import { Profile, UserRole } from '@/types/database';

interface StaffManagementProps {
  staffList: Profile[];
  onAddStaff: (staffData: any) => Promise<boolean>;
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
  const [phone, setPhone] = useState('+9665');
  const [jobRole, setJobRole] = useState<'driver' | 'staff'>('driver');
  const [canViewAll, setCanViewAll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxStaffLimit = 5;
  const currentCount = staffList.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCount >= maxStaffLimit) {
      alert(`عذراً، تم الوصول للحد الأقصى لعدد الموظفين والسائقين المتاحين (${maxStaffLimit} مستخدمين).`);
      return;
    }

    setIsSubmitting(true);
    const roleTitle = jobRole === 'driver' ? '(سائق رافعة وتوصيل)' : '(موظف استقبال ومتابعة)';
    const success = await onAddStaff({
      full_name: `${fullName} ${roleTitle}`,
      email,
      phone,
      can_view_all_records: canViewAll
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
            إدارة الموظفين والسائقين
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            توزيع وتعيين السائقين وموظفي الاستقبال، أرقام الواتساب، وإدارة الصلاحيات (متاح {currentCount} من أصل {maxStaffLimit})
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
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>الاسم والدور</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>رقم جوال الواتساب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>البريد الإلكتروني</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>رؤية العقود</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>حالة الحساب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => {
              const isDriver = staff.full_name.includes('سائق');
              const isAdmin = staff.role === 'admin';

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
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: isAdmin ? 'rgba(245, 158, 11, 0.2)' : isDriver ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isAdmin ? <ShieldCheck size={18} color="#fbbf24" /> : isDriver ? <Truck size={18} color="#34d399" /> : <Briefcase size={18} color="#38bdf8" />}
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
                    <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                      {staff.phone || 'غير مسجل'}
                    </span>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {staff.email}
                  </td>

                  {/* View All Permission */}
                  <td style={{ padding: '16px 20px' }}>
                    {staff.role === 'admin' ? (
                      <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>كافة السجلات (شامل)</span>
                    ) : (
                      <button
                        onClick={() => onToggleViewAll(staff.id, staff.can_view_all_records)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: staff.can_view_all_records ? '#34d399' : '#94a3b8',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        {staff.can_view_all_records ? <Eye size={15} /> : <EyeOff size={15} />}
                        <span>{staff.can_view_all_records ? 'يرى كل العقود' : 'عقوده المسندة فقط'}</span>
                      </button>
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
                        title="حذف الموظف"
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

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
              إضافة سائق أو موظف جديد
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
              حدد اسم الموظف ودوره ورقم جواله لإسناد وتوجيه العقود الميدانية إليه
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Role Type Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#fbbf24' }}>
                  نوع الدور / الوظيفة:
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
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Truck size={22} color={jobRole === 'driver' ? '#34d399' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: jobRole === 'driver' ? '#34d399' : '#ffffff' }}>
                      سائق رافعة وتوصيل 🚛
                    </div>
                  </div>

                  <div
                    onClick={() => setJobRole('staff')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: `2px solid ${jobRole === 'staff' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: jobRole === 'staff' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Briefcase size={22} color={jobRole === 'staff' ? '#38bdf8' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: jobRole === 'staff' ? '#38bdf8' : '#ffffff' }}>
                      موظف استقبال ومتابعة 👷
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: خالد الدوسري"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#38bdf8' }}>
                  رقم جوال الواتساب (لاستلام أوامر التشغيل):
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9665XXXXXXXX"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  البريد الإلكتروني (لتسجيل الدخول):
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khalid@almuhtaraz.com"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  required
                />
              </div>

              {/* Permission */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={canViewAll}
                  onChange={(e) => setCanViewAll(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span>منحه صلاحية رؤية كافة عقود وحاويات المنشأة</span>
              </label>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
                  {isSubmitting ? 'جارٍ الإضافة...' : 'حفظ وإضافة'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
