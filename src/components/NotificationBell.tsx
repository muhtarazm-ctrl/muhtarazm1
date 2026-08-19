'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Truck, 
  DollarSign, 
  Info,
  X
} from 'lucide-react';
import { InAppNotification, InAppNotificationType } from '@/types/database';

interface NotificationBellProps {
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectContract?: (contractId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectContract
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayedNotifications = filterUnreadOnly 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  const getNotificationIcon = (type: InAppNotificationType) => {
    switch (type) {
      case 'contract_expiry_soon':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'contract_created':
        return <FileText size={18} color="#10b981" />;
      case 'container_status_change':
        return <Truck size={18} color="#0ea5e9" />;
      case 'payment_alert':
        return <DollarSign size={18} color="#fbbf24" />;
      default:
        return <Info size={18} color="#a5b4fc" />;
    }
  };

  const getBorderColor = (type: InAppNotificationType) => {
    switch (type) {
      case 'contract_expiry_soon': return '#f59e0b';
      case 'contract_created': return '#10b981';
      case 'container_status_change': return '#0ea5e9';
      case 'payment_alert': return '#fbbf24';
      default: return '#6366f1';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'الآن';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  const handleNotificationClick = (n: InAppNotification) => {
    if (!n.is_read) {
      onMarkAsRead(n.id);
    }
    if (n.contract_id && onSelectContract) {
      onSelectContract(n.contract_id);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="الإشعارات والتنبيهات الداخلية"
        style={{
          position: 'relative',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: isOpen ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.12)',
          color: isOpen ? '#fbbf24' : '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease'
        }}
      >
        <Bell size={20} />

        {/* Pulse Red Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 800,
            minWidth: '20px',
            height: '20px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
            animation: 'radialPulse 2s infinite ease-in-out'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '52px',
          left: 0,
          width: '380px',
          maxHeight: '520px',
          background: '#0b111e',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '18px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* Dropdown Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="#fbbf24" />
              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>التنبيهات والإشعارات</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {unreadCount} جديد
                </span>
              )}
            </div>

            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'inherit'
                }}
              >
                <CheckCheck size={14} />
                <span>قراءة الكل</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div style={{
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setFilterUnreadOnly(false)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: !filterUnreadOnly ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: !filterUnreadOnly ? '#fbbf24' : '#94a3b8'
                }}
              >
                الكل ({notifications.length})
              </button>
              <button
                onClick={() => setFilterUnreadOnly(true)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: filterUnreadOnly ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: filterUnreadOnly ? '#f87171' : '#94a3b8'
                }}
              >
                غير المقروءة ({unreadCount})
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="مسح جميع التنبيهات"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'inherit'
                }}
              >
                <Trash2 size={12} />
                <span>مسح</span>
              </button>
            )}
          </div>

          {/* Notifications Scrollable List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '380px'
          }}>
            {displayedNotifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: n.is_read ? 'transparent' : 'rgba(245, 158, 11, 0.05)',
                  borderRight: `3px solid ${getBorderColor(n.type)}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(245, 158, 11, 0.05)')}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {getNotificationIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: n.is_read ? '600' : '800',
                      color: n.is_read ? '#cbd5e1' : '#ffffff'
                    }}>
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        display: 'inline-block'
                      }} />
                    )}
                  </div>

                  <p style={{
                    fontSize: '0.82rem',
                    color: '#94a3b8',
                    lineHeight: '1.4',
                    marginBottom: '6px'
                  }}>
                    {n.message}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    color: '#64748b'
                  }}>
                    <Clock size={11} />
                    <span>{formatRelativeTime(n.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}

            {displayedNotifications.length === 0 && (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                <Bell size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>
                  {filterUnreadOnly ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات حالياً'}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
