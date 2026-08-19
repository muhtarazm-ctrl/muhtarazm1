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
  Copy,
  Check,
  ExternalLink,
  Zap,
  Info,
  User,
  Crown
} from 'lucide-react';
import { WhatsAppSettings as IWhatsAppSettings, WhatsAppMode, NotificationLog } from '@/types/database';

interface WhatsAppSettingsProps {
  settings: IWhatsAppSettings;
  notifications: NotificationLog[];
  onSaveSettings: (updated: IWhatsAppSettings) => Promise<boolean>;
  onTestConnection: (testPhone: string) => Promise<boolean>;
  onSendWhatsApp: (phone: string, message: string) => void;
  onMarkAsSent?: (notifId: string) => Promise<void>;
}

export const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({
  settings,
  notifications,
  onSaveSettings,
  onTestConnection,
  onSendWhatsApp,
  onMarkAsSent
}) => {
  // Mode selection state: 'evolution' or 'wame'
  const [mode, setMode] = useState<WhatsAppMode>(settings.mode || 'evolution');

  // Option 1: Evolution API State
  const [evolutionServerUrl, setEvolutionServerUrl] = useState(settings.evolution_server_url || 'http://localhost:8080');
  const [evolutionInstanceName, setEvolutionInstanceName] = useState(settings.evolution_instance_name || 'muhtaraz-instance');
  const [evolutionApiKey, setEvolutionApiKey] = useState(settings.evolution_api_key || '123456');

  // Common State
  const [senderPhone, setSenderPhone] = useState(settings.sender_phone || '+966920001234');
  const [adminPhone, setAdminPhone] = useState(settings.admin_phone || '+966500000001');
  const [isConnected, setIsConnected] = useState(settings.is_connected ?? true);
  const [autoSendEnabled, setAutoSendEnabled] = useState(settings.auto_send_enabled ?? true);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isCopiedDocker, setIsCopiedDocker] = useState(false);

  const dockerCommand = `docker run -d --name evolution-api -p 8080:8080 -e AUTHENTICATION_API_KEY=${evolutionApiKey || '123456'} evoapicloud/evolution-api:latest`;

  const handleCopyDocker = () => {
    navigator.clipboard.writeText(dockerCommand);
    setIsCopiedDocker(true);
    setTimeout(() => setIsCopiedDocker(false), 2500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const updated: IWhatsAppSettings = {
      ...settings,
      mode,
      evolution_server_url: evolutionServerUrl,
      evolution_instance_name: evolutionInstanceName,
      evolution_api_key: evolutionApiKey,
      sender_phone: senderPhone,
      admin_phone: adminPhone,
      is_connected: isConnected,
      auto_send_enabled: autoSendEnabled,
      updated_at: new Date().toISOString()
    };

    // Save to localStorage as well for instant persistent restore
    try {
      localStorage.setItem('muhtaraz_whatsapp_settings', JSON.stringify(updated));
    } catch (err) {}

    const ok = await onSaveSettings(updated);
    setIsSaving(false);
    if (ok) {
      alert('تم حفظ إعدادات محرك الواتساب بنجاح!');
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
      setTestResult('❌ تعذر الاتصال بمحاكي Evolution API. تأكد من تشغيل السيرفر على ' + evolutionServerUrl);
    }
  };

  const handleDirectClickSend = (phone: string, message: string, notifId?: string) => {
    onSendWhatsApp(phone, message);
    if (notifId && onMarkAsSent) {
      onMarkAsSent(notifId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
          <Sparkles size={16} />
          <span>محرك الإشعارات المجاني 100% (0 ريال)</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
          إعدادات ومحرك الواتساب (WhatsApp Engine)
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          اختر بين الإرسال التلقائي الصامت عبر المحاكي المحلي المفتوح المصدر أو نظام النقر المباشر السريع
        </p>
      </div>

      {/* 2 Main Choice Cards (Interactive Switcher) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Option 1 Card: Evolution API */}
        <div 
          onClick={() => {
            setMode('evolution');
            setAutoSendEnabled(true);
          }}
          className="glass-panel"
          style={{
            padding: '24px',
            cursor: 'pointer',
            border: `2px solid ${mode === 'evolution' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
            background: mode === 'evolution' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)',
            boxShadow: mode === 'evolution' ? '0 0 30px rgba(16, 185, 129, 0.25)' : 'none',
            borderRadius: '20px',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: mode === 'evolution' ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Server size={26} color={mode === 'evolution' ? '#050811' : '#cbd5e1'} />
            </div>

            <span style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: mode === 'evolution' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              color: mode === 'evolution' ? '#34d399' : '#94a3b8',
              border: `1px solid ${mode === 'evolution' ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`
            }}>
              {mode === 'evolution' ? '✓ الوضع المعتمد حالياً' : 'اختيار هذا الوضع'}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: mode === 'evolution' ? '#34d399' : '#ffffff' }}>
              الخيار 1: المحاكي المحلي - Evolution API
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', lineHeight: '1.5' }}>
              <strong>إرسال تلقائي صامت 100% (0 ريال)</strong> عبر سيرفر محلي مفتوح المصدر على جهازك، مع مسح كود QR مرة واحدة.
            </p>
          </div>
        </div>

        {/* Option 2 Card: Direct wa.me */}
        <div 
          onClick={() => {
            setMode('wame');
            setAutoSendEnabled(false);
          }}
          className="glass-panel"
          style={{
            padding: '24px',
            cursor: 'pointer',
            border: `2px solid ${mode === 'wame' ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}`,
            background: mode === 'wame' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(15, 23, 42, 0.6)',
            boxShadow: mode === 'wame' ? '0 0 30px rgba(245, 158, 11, 0.25)' : 'none',
            borderRadius: '20px',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: mode === 'wame' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={26} color={mode === 'wame' ? '#050811' : '#cbd5e1'} />
            </div>

            <span style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: mode === 'wame' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              color: mode === 'wame' ? '#fbbf24' : '#94a3b8',
              border: `1px solid ${mode === 'wame' ? 'rgba(245, 158, 11, 0.4)' : 'transparent'}`
            }}>
              {mode === 'wame' ? '✓ الوضع المعتمد حالياً' : 'اختيار هذا الوضع'}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: mode === 'wame' ? '#fbbf24' : '#ffffff' }}>
              الخيار 2: نظام النقر المباشر - wa.me
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', lineHeight: '1.5' }}>
              <strong>مجاني وبدون أي سيرفرات أو إعدادات برمجية</strong>. تظهر العقود بأزرار سريعة مجهزة للنقر المباشر بنقرة واحدة.
            </p>
          </div>
        </div>

      </div>

      {/* =========================================================================
          VIEW 1: Evolution API Config & Step-by-Step Guide
          ========================================================================= */}
      {mode === 'evolution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Step by Step Guide Card */}
          <div className="glass-panel" style={{ padding: '28px', borderRight: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📋 خطوات تشغيل المحاكي المحلي المجاني (Evolution API):</span>
              </h3>

              <a 
                href="https://github.com/evolution-foundation/evolution-api" 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>رابط المشروع والتوثيق على GitHub</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#050811', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                    تثبيت برنامج Docker Desktop على كمبيوتر المؤسسة:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    قم بتحميل وتثبيت Docker مجاناً لتشغيل محاكي الواتساب كحاوية خفيفة في الخلفية.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#050811', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                    تشغيل أمر السيرفر عبر Terminal أو PowerShell:
                  </div>
                  
                  {/* Command box with copy button */}
                  <div style={{
                    background: '#040711',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    direction: 'ltr',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#34d399'
                  }}>
                    <span style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>{dockerCommand}</span>
                    <button
                      onClick={handleCopyDocker}
                      style={{
                        background: isCopiedDocker ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: isCopiedDocker ? '#050811' : '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {isCopiedDocker ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopiedDocker ? 'تم النسخ' : 'نسخ الأمر'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#050811', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                    توليد ومسح كود QR بالواتساب:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                    افتح واتساب على جوال المؤسسة، ادخل على (الأجهزة المرتبطة) وامسح الكود لربط الرقم الموحد.
                  </div>
                  <button
                    type="button"
                    className="btn-emerald"
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                    onClick={() => setShowQrModal(true)}
                  >
                    <QrCode size={16} />
                    <span>توليد ومسح كود QR الآن</span>
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#050811', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  4
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34d399' }}>
                    اكتمال الربط والتشغيل التلقائي الصامت:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    تتحول الحالة إلى <strong style={{ color: '#34d399' }}>"متصل بنجاح 🟢"</strong> ويبدأ النظام بإرسال كافة التنبيهات تلقائياً في موعدها المحدد دون أي تدخل منك.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fbbf24' }}>
              حقول ربط السيرفر المحلي (Evolution API Settings):
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  رابط السيرفر المحلي:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={evolutionServerUrl}
                  onChange={(e) => setEvolutionServerUrl(e.target.value)}
                  placeholder="http://localhost:8080"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  اسم الجلسة (Instance Name):
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={evolutionInstanceName}
                  onChange={(e) => setEvolutionInstanceName(e.target.value)}
                  placeholder="muhtaraz-instance"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  المفتاح السري المحلي (API Key):
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={evolutionApiKey}
                  onChange={(e) => setEvolutionApiKey(e.target.value)}
                  placeholder="123456"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#fbbf24' }}>
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
              </div>
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleTest}
                disabled={isTesting}
              >
                <Send size={16} />
                <span>{isTesting ? 'جارٍ الفحص...' : 'اختبار الاتصال بالسيرفر وإرسال رسالة'}</span>
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSaving}
                style={{ minWidth: '160px' }}
              >
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ واعتماد الوضع'}
              </button>
            </div>
          </form>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: wa.me Direct Click System (No Server Required)
          ========================================================================= */}
      {mode === 'wame' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Instructions Card for wa.me */}
          <div className="glass-panel" style={{ padding: '28px', borderRight: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={22} color="#fbbf24" />
              <span>طريقة عمل نظام النقر المباشر (wa.me) - مجاني 100%:</span>
            </h3>

            <div style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>
                • <strong>الآلية:</strong> يعتمد هذا الخيار على بروتوكول واتساب المباشر الرسمي. عند استحقاق أي تنبيه، ستظهر العقود في قائمة التنبيهات المستحقة بالأسفل مع <strong>3 أزرار سريعة ملونة</strong>:
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '6px 0' }}>
                <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  👤 إرسال للعميل (أخضر)
                </span>
                <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                  👷 إرسال للموظف والسائق (أزرق)
                </span>
                <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  👑 إرسال للمدير العام (ذهبي)
                </span>
              </div>
              <p style={{ color: '#94a3b8' }}>
                • عند النقر على أي زر، يفتح تطبيق واتساب على هاتفك أو كمبيوترك فوراً والرسالة <strong>مجهزة بالكامل ومكتوبة</strong> وجاهزة للضغط على زر الإرسال بنقرة واحدة فقط ودون الحاجة لتشغيل أي برامج أو سيرفرات إضافية.
              </p>
            </div>

            {/* Simple phone fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  رقم جوال المنشأة:
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+966500000000"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#fbbf24' }}>
                  رقم جوال المدير العام:
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+966500000001"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSave()}
                disabled={isSaving}
                style={{ padding: '8px 20px', fontSize: '0.88rem' }}
              >
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ واعتماد وضع wa.me'}
              </button>
            </div>
          </div>

          {/* Live Due Notifications Table with 3 Quick Buttons */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                طابور التنبيهات المستحقة (انقر للإرسال المباشر بنقرة واحدة):
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                ({notifications.length} تنبيهات مسجلة)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {notifications.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="glass-panel"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderRight: '4px solid #f59e0b'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                        {item.recipient_name || 'عقد حاوية'} — {item.recipient_phone}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                        الموعد المجدول: {new Date(item.scheduled_for).toLocaleString('ar-SA')}
                      </div>
                    </div>

                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: item.status === 'sent' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: item.status === 'sent' ? '#34d399' : '#fbbf24'
                    }}>
                      {item.status === 'sent' ? 'تم الإرسال مسبقاً' : 'مستحق الإرسال'}
                    </span>
                  </div>

                  {/* Message body */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    {item.message_body}
                  </div>

                  {/* 3 Colorful Action Buttons for Customer, Employee, Admin */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {/* Button 1: Send to Customer (Green) */}
                    <button
                      className="btn-emerald"
                      style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                      onClick={() => handleDirectClickSend(item.recipient_phone, item.message_body, item.id)}
                    >
                      <User size={14} />
                      <span>إرسال للعميل 👤</span>
                      <ExternalLink size={12} />
                    </button>

                    {/* Button 2: Send to Employee (Blue) */}
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '7px 16px',
                        fontSize: '0.82rem',
                        background: 'rgba(14, 165, 233, 0.2)',
                        border: '1px solid rgba(14, 165, 233, 0.4)',
                        color: '#38bdf8'
                      }}
                      onClick={() => handleDirectClickSend('+966550000002', `تنبيه تشغيلي للموظف: ${item.message_body}`, item.id)}
                    >
                      <UserCheck size={14} />
                      <span>إرسال للموظف والسائق 👷</span>
                      <ExternalLink size={12} />
                    </button>

                    {/* Button 3: Send to Admin (Gold) */}
                    {adminPhone && (
                      <button
                        className="btn-primary"
                        style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                        onClick={() => handleDirectClickSend(adminPhone, `نسخة للمدير العام: ${item.message_body}`, item.id)}
                      >
                        <Crown size={14} />
                        <span>إرسال للمدير العام 👑</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* QR Code Scanner Simulation Modal for Evolution API */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '420px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
              مسح كود QR لربط واتساب
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
              افتح تطبيق واتساب على هاتفك > الأجهزة المرتبطة > ربط جهاز، ثم امسح الكود أدناه:
            </p>

            {/* Generated QR Box */}
            <div style={{
              width: '220px',
              height: '220px',
              margin: '0 auto 20px auto',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(16, 185, 129, 0.4)'
            }}>
              <QrCode size={180} color="#050811" />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700, marginBottom: '20px' }}>
              🟢 جاهز للاقتران بالجلسة ({evolutionInstanceName})
            </div>

            <button
              className="btn-emerald"
              style={{ width: '100%' }}
              onClick={() => {
                setIsConnected(true);
                setShowQrModal(false);
                alert('تم اقتران وربط الواتساب بنجاح 🟢!');
              }}
            >
              <CheckCircle2 size={16} />
              <span>تم المسح وتأكيد الاتصال</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
