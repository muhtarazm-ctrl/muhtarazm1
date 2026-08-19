'use client';

import React from 'react';
import { 
  Truck, 
  Search, 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  Users, 
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Settings,
  CreditCard,
  Package
} from 'lucide-react';
import { InAppNotification, Profile, StaffPermissions, UserRole } from '@/types/database';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  staffList?: Profile[];
  selectedStaffId?: string;
  setSelectedStaffId?: (id: string) => void;
  permissions?: StaffPermissions;
  onReplayIntro: () => void;
  onOpenNewContract: () => void;
  inAppNotifications: InAppNotification[];
  onMarkInAppAsRead: (id: string) => void;
  onMarkAllInAppAsRead: () => void;
  onClearAllInApp: () => void;
  onSelectContract: (contractId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  staffList = [],
  selectedStaffId,
  setSelectedStaffId,
  permissions,
  onReplayIntro,
  onOpenNewContract,
  inAppNotifications,
  onMarkInAppAsRead,
  onMarkAllInAppAsRead,
  onClearAllInApp,
  onSelectContract,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setCurrentTab('search')}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
          }}>
            <Truck size={24} color="#050811" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
              المحترز <span style={{ color: 'var(--accent-gold)' }}>للحاويات</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              إدارة وتأجير الحاويات التجارية والأنقاض
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            id="nav-search-tab"
            onClick={() => setCurrentTab('search')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: currentTab === 'search' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: currentTab === 'search' ? '#fbbf24' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={17} />
            <span>البحث والاستعلام</span>
          </button>

          <button
            id="nav-containers-tab"
            onClick={() => setCurrentTab('containers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: currentTab === 'containers' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: currentTab === 'containers' ? '#fbbf24' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            <Truck size={17} />
            <span>الحاويات</span>
          </button>

          <button
            id="nav-contracts-tab"
            onClick={() => setCurrentTab('contracts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: currentTab === 'contracts' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: currentTab === 'contracts' ? '#fbbf24' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={17} />
            <span>سجل العقود والتحصيل</span>
          </button>

          <button
            id="nav-whatsapp-tab"
            onClick={() => setCurrentTab('whatsapp')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: currentTab === 'whatsapp' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: currentTab === 'whatsapp' ? '#34d399' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageSquare size={17} />
            <span>محرك الواتساب</span>
          </button>

          {/* Admin only Tabs */}
          {currentRole === 'admin' && (
            <>
              <button
                id="nav-inventory-tab"
                onClick={() => setCurrentTab('inventory')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: currentTab === 'inventory' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: currentTab === 'inventory' ? '#38bdf8' : '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
              >
                <Package size={17} />
                <span>إدارة المخزون والتوريد</span>
              </button>

              <button
                id="nav-staff-tab"
                onClick={() => setCurrentTab('staff')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: currentTab === 'staff' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: currentTab === 'staff' ? '#a5b4fc' : '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={17} />
                <span>إدارة الموظفين</span>
              </button>

              <button
                id="nav-payment-settings-tab"
                onClick={() => setCurrentTab('payment-settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: currentTab === 'payment-settings' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: currentTab === 'payment-settings' ? '#34d399' : '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
              >
                <CreditCard size={17} />
                <span>بوابة الدفع</span>
              </button>

              <button
                id="nav-gateway-settings-tab"
                onClick={() => setCurrentTab('gateway-settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: currentTab === 'gateway-settings' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: currentTab === 'gateway-settings' ? '#fbbf24' : '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
              >
                <Settings size={17} />
                <span>إعدادات البوابة</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Actions: In-App Bell, New Contract, Role Switcher, Replay Intro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* 🔔 In-App Notification Bell Component */}
          <NotificationBell
            notifications={inAppNotifications}
            onMarkAsRead={onMarkInAppAsRead}
            onMarkAllAsRead={onMarkAllInAppAsRead}
            onClearAll={onClearAllInApp}
            onSelectContract={onSelectContract}
          />

          {/* New Contract Button (Admin or if has create contract permission) */}
          {(currentRole === 'admin' || permissions?.can_create_contracts !== false) && (
            <button
              id="btn-open-new-contract"
              className="btn-primary"
              onClick={onOpenNewContract}
              style={{ padding: '9px 18px', fontSize: '0.9rem' }}
            >
              <PlusCircle size={18} />
              <span>عقد جديد</span>
            </button>
          )}

          {/* Role Switcher for preview / auth */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => setCurrentRole('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: currentRole === 'admin' ? '#f59e0b' : 'transparent',
                color: currentRole === 'admin' ? '#050811' : '#94a3b8'
              }}
            >
              <ShieldCheck size={14} />
              <span>المدير</span>
            </button>
            <button
              onClick={() => setCurrentRole('employee')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: currentRole === 'employee' ? '#0ea5e9' : 'transparent',
                color: currentRole === 'employee' ? '#ffffff' : '#94a3b8'
              }}
            >
              <UserCheck size={14} />
              <span>موظف</span>
            </button>
          </div>

          {/* If Employee Role: Show Active Staff Selector Dropdown (Office staff only, Drivers do not login) */}
          {currentRole === 'employee' && staffList.length > 0 && setSelectedStaffId && (
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '5px 8px',
                fontSize: '0.78rem',
                fontFamily: 'inherit',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="تحديد حساب موظف الاستقبال لمعاينة صلاحياته"
            >
              {staffList.filter(s => s.role !== 'admin' && !s.full_name.includes('سائق')).map(s => (
                <option key={s.id} value={s.id}>
                  👷 {s.full_name}
                </option>
              ))}
            </select>
          )}

          {/* Replay Intro Button */}
          <button
            title="إعادة تشغيل المقدمة السينمائية"
            onClick={onReplayIntro}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
