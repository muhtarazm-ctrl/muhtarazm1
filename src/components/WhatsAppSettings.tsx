'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Sparkles, 
  Key, 
  Server, 
  Phone, 
  UserCheck, 
  RefreshCw,
  QrCode,
  Lock
} from 'lucide-react';
import { WhatsAppSettings as IWhatsAppSettings, WhatsAppProvider } from '@/types/database';

interface WhatsAppSettingsProps {
  settings: IWhatsAppSettings;
  onSaveSettings: (updated: IWhatsAppSettings) => Promise<boolean>;
  onTestConnection: (testPhone: string) => Promise<boolean>;
  onRunBatchProcess: () => Promise<number>;
}

export const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({
  settings,
  onSaveSettings,
  onTestConnection,
  onRunBatchProcess
}) => {
  const [provider, setProvider] = useState<WhatsAppProvider>(settings.provider || 'ultramsg');
  const [instanceId, setInstanceId] = useState(settings.instance_id || 'instance_muhtaraz_01');
  const [apiToken, setApiToken] = useState(settings.api_token || 'tok_muhtaraz_sec_9988');
  const [apiUrl, setApiUrl] = useState(settings.api_url || 'https://api.ultramsg.com');
  const [senderPhone, setSenderPhone] = useState(settings.sender_phone || '+966920001234');
  const [adminPhone, setAdminPhone] = useState(settings.admin_phone || '+966500000001');
  const [autoSendEnabled, setAutoSendEnabled] = useState(settings.auto_send_enabled ?? true);
  const [isConnected, setIsConnected] = useState(settings.is_connected ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueResult, setQueueResult] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated: IWhatsAppSettings = {
      ...settings,
      provider,
      instance_id: instanceId,
      api_token: apiToken,
      api_url: apiUrl,
      sender_phone: senderPhone,
      admin_phone: adminPhone,
      auto_send_enabled: autoSendEnabled,
      is_connected: isConnected,
      updated_at: new Date().toISOString()
    };
    const ok = await onSaveSettings(updated);
    setIsSaving(false);
    if (ok) {
      alert('تم حفظ إعدادات بوابة الواتساب بنجاح!');
    }
  };

  const handleTest = async () => {
    if (!adminPhone) {
      alert('يرجى تحديد رقم جوال المدير لاستقبال الرسالة التجريبية.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const success = await onTestConnection(adminPhone);
    setIsTesting(false);
    if (success) {
      setIsConnected(true);
      setTestResult('✅ تم الاتصال بنجاح وإرسال رسالة تجريبية إلى جوال المدير!');
    } else {
      setTestResult('❌ تعذر الاتصال بالبوابة. يرجى التحقق من المفاتيح ورمز الـ Token.');
    }
  };

  const handleRunQueue = async () => {
    setIsProcessingQueue(true);
    setQueueResult(null);
    const count = await onRunBatchProcess();
    setIsProcessingQueue(false);
    setQueueResult(`✅ تمت معالجة وإرسال (${count}) إشعارات مستحقة بنجاح إلى العميل والموظف والمدير.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
          <ShieldCheck size={16} />
          <span>خاص بالإدارة العامة</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff' }}>
          إعدادات ربط بوابة الواتساب الموحدة (WhatsApp Gateway)
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          ضبط وتفعيل مزود خدمة الإرسال التلقائي للرسائل الصامتة عند استحقاق مواعيد السحب والتجديد
        </p>
      </div>

      {/* Gateway Status & Auto-Send Card */}
      <div className="glass-panel" style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: `4px solid ${isConnected ? '#10b981' : '#ef4444'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
          }}>
            <Radio size={28} color={isConnected ? '#34d399' : '#f87171'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                حالة بوابة الواتساب:
              </h3>
              <span style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isConnected ? '#34d399' : '#f87171',
                border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {isConnected ? '🟢 متصل وجاهز للإرسال الآلي' : '🔴 غير متصل'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
              الرقم الموحد المربوط: <strong style={{ color: '#fbbf24', direction: 'ltr', display: 'inline-block' }}>{senderPhone}</strong>
            </p>
          </div>
        </div>

        {/* Auto-Send Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '12px 18px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>الإرسال التلقائي الصامت</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>إرسال مباشر من السيرفر دون تدخل بشري</div>
          </div>
          <input
            type="checkbox"
            id="autoSendSwitch"
            checked={autoSendEnabled}
            onChange={(e) => setAutoSendEnabled(e.target.checked)}
            style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#10b981' }}
          />
        </div>
      </div>

      {/* Target Recipients Explanation Banner */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.12)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '16px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <Sparkles size={24} color="#a5b4fc" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          <strong style={{ color: '#ffffff' }}>آلية الإرسال التلقائي للأطراف الثلاثة:</strong>
          <br />
          عند استحقاق موعد الإشعار (قبل 4 ساعات لعقود الأنقاض، أو قبل 7 أيام للتجاري)، يرسل السيرفر الإشعار تلقائياً إلى:
          <br />
          1. 👤 <strong>العميل:</strong> رسالة تذكير بالسحب أو التجديد.
          &nbsp;&nbsp;|&nbsp;&nbsp;
          2. 👷 <strong>الموظف المسؤول:</strong> تنبيه تشغيلي لإرسال السائق.
          &nbsp;&nbsp;|&nbsp;&nbsp;
          3. 👑 <strong>المدير العام:</strong> إشعار إداري للمتابعة.
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Provider */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#fbbf24' }}>
              مزود خدمة الواتساب (WhatsApp Provider):
            </label>
            <select
              className="form-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as WhatsAppProvider)}
            >
              <option value="ultramsg">UltraMsg API (الموصى به - مسح QR Code مباشر)</option>
              <option value="wasapi">Wasapi Cloud Gateway</option>
              <option value="twilio">Twilio WhatsApp Business API</option>
              <option value="webhook">Custom Webhook Gateway (مخصص)</option>
            </select>
          </div>

          {/* Instance ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#e2e8f0' }}>
              معرف الجلسة (Instance ID):
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder="مثال: instance104928"
                style={{ direction: 'ltr', textAlign: 'left' }}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* API Token */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#e2e8f0' }}>
              رمز الـ API السري (API Token):
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                style={{ direction: 'ltr', textAlign: 'left' }}
                required
              />
            </div>
          </div>

          {/* API Endpoint URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#e2e8f0' }}>
              رابط البوابة (Gateway Base URL):
            </label>
            <input
              type="text"
              className="form-input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.ultramsg.com"
              style={{ direction: 'ltr', textAlign: 'left' }}
              required
            />
          </div>
        </div>

        {/* Numbers Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Unified WhatsApp Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#38bdf8' }}>
              الرقم الموحد للمنشأة (المرسل):
            </label>
            <input
              type="tel"
              className="form-input"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="+966920001234"
              style={{ direction: 'ltr', textAlign: 'left' }}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              الرقم المربوط عبر QR Code والذي تخرج منه الرسائل لجميع العملاء.
            </span>
          </div>

          {/* Admin Notification Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#fbbf24' }}>
              رقم جوال المدير العام (لاستلام التنبيهات):
            </label>
            <input
              type="tel"
              className="form-input"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+966500000001"
              style={{ direction: 'ltr', textAlign: 'left' }}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              يستقبل تنبيهاً فورياً عند تسجيل أي عقد أو قرب انتهاء الحاويات في الميدان.
            </span>
          </div>
        </div>

        {/* Action Results */}
        {testResult && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            background: testResult.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: testResult.includes('✅') ? '#34d399' : '#f87171',
            border: `1px solid ${testResult.includes('✅') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {testResult}
          </div>
        )}

        {queueResult && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            {queueResult}
          </div>
        )}

        {/* Buttons Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTest}
              disabled={isTesting}
            >
              <Send size={16} />
              <span>{isTesting ? 'جارٍ الفحص...' : 'اختبار الاتصال وإرسال رسالة تجريبية'}</span>
            </button>

            <button
              type="button"
              className="btn-emerald"
              onClick={handleRunQueue}
              disabled={isProcessingQueue}
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
            >
              <RefreshCw size={16} className={isProcessingQueue ? 'animate-spin' : ''} />
              <span>{isProcessingQueue ? 'جارٍ المعالجة...' : 'تشغيل فحص وإرسال الإشعارات المستحقة الآن'}</span>
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ minWidth: '150px' }}
          >
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>

      </form>
    </div>
  );
};
