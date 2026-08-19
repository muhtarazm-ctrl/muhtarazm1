'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { NotificationLog, NotificationType, RecipientRole } from '@/types/database';

interface WhatsAppHubProps {
  notifications: NotificationLog[];
  onMarkAsSent: (notificationId: string) => Promise<void>;
  onSendWhatsApp: (phone: string, message: string) => void;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  notifications,
  onMarkAsSent,
  onSendWhatsApp
}) => {
  const [filterRole, setFilterRole] = useState<'all' | RecipientRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filterRole !== 'all' && n.recipient_role !== filterRole) return false;
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    return true;
  });

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'debris_pickup_4h':
        return { label: 'تنبيه سحب أنقاض (قبل 4 ساعات)', bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24' };
      case 'commercial_7d_before':
        return { label: 'إشعار تجاري (قبل 7 أيام)', bg: 'rgba(99, 102, 241, 0.18)', color: '#a5b4fc' };
      case 'commercial_2d_before':
        return { label: 'تذكير تجاري حرج (قبل يومين)', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171' };
      case 'contract_created':
        return { label: 'توثيق عقد جديد', bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399' };
      default:
        return { label: 'تنبيه مخصص', bg: 'rgba(14, 165, 233, 0.18)', color: '#38bdf8' };
    }
  };

  const handleSendAndMark = async (n: NotificationLog) => {
    onSendWhatsApp(n.recipient_phone, n.message_body);
    await onMarkAsSent(n.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
            <Sparkles size={16} />
            <span>محرك التنبيهات المجدولة الذكي</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            مركز إشعارات ورسائل الواتساب
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            جدولة وإرسال الرسائل التلقائية للعملاء والموظفين قبل موعد السحب أو التجديد
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Recipient Role Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>المستلم:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'customer', label: 'العملاء' },
            { id: 'employee', label: 'الموظفون والسائقون' },
            { id: 'admin', label: 'الإدارة' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setFilterRole(r.id as any)}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterRole === r.id ? '#10b981' : 'transparent',
                background: filterRole === r.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: filterRole === r.id ? '#34d399' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'قيد الانتظار' },
            { id: 'sent', label: 'تم الإرسال' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id as any)}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterStatus === s.id ? 'var(--accent-gold)' : 'transparent',
                background: filterStatus === s.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: filterStatus === s.id ? '#fbbf24' : '#94a3b8',
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

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredNotifications.map(item => {
          const badge = getNotificationBadge(item.notification_type);

          return (
            <div
              key={item.id}
              className="glass-panel glass-card-interactive"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderRight: `4px solid ${badge.color}`
              }}
            >
              {/* Left Column: Details */}
              <div style={{ flex: '1', minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: badge.bg,
                    color: badge.color
                  }}>
                    {badge.label}
                  </span>

                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: '700' }}>
                    المستلم: {item.recipient_name || (item.recipient_role === 'customer' ? 'العميل' : item.recipient_role === 'employee' ? 'الموظف' : 'المدير')}
                  </span>

                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', direction: 'ltr' }}>
                    ({item.recipient_phone})
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    color: item.status === 'sent' ? '#34d399' : '#fbbf24',
                    background: item.status === 'sent' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {item.status === 'sent' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    <span>{item.status === 'sent' ? 'تم الإرسال' : 'مجدول'}</span>
                  </span>
                </div>

                {/* Message Body preview */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  color: '#cbd5e1',
                  lineHeight: '1.5'
                }}>
                  {item.message_body}
                </div>

                {/* Scheduled time */}
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>وقت الجدولة: {new Date(item.scheduled_for).toLocaleString('ar-SA')}</span>
                </div>
              </div>

              {/* Right Column: Send WhatsApp Button */}
              <div>
                <button
                  className="btn-emerald"
                  style={{ minWidth: '170px' }}
                  onClick={() => handleSendAndMark(item)}
                >
                  <MessageSquare size={16} />
                  <span>إرسال عبر واتساب</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <MessageSquare size={40} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '4px' }}>لا توجد تنبيهات في هذا السجل</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>سيتم توليد التنبيهات تلقائياً عند حفظ وتوثيق أي عقد جديد.</p>
        </div>
      )}

    </div>
  );
};
