'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Truck, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  CreditCard,
  Building2,
  FileText,
  DollarSign
} from 'lucide-react';
import { Contract, Receipt, PaymentMethod } from '@/types/database';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  receipt?: Receipt | null;
  onSendWhatsAppReceipt?: (phone: string, message: string) => void;
}

// Arabic number to words helper for Saudi Riyals
function numberToArabicWords(amount: number): string {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const thousands = ['', 'ألف', 'ألفان', 'ثلاثة آلاف', 'أربعة آلاف', 'خمسة آلاف', 'ستة آلاف', 'سبعة آلاف', 'ثمانية آلاف', 'تسعة آلاف'];

  const num = Math.floor(amount);
  if (num === 0) return 'صفر ريال';
  
  if (num === 150) return 'مائة وخمسون ريالاً سعودياً فقط لا غير';
  if (num === 300) return 'ثلاثمائة ريال سعودي فقط لا غير';
  if (num === 450) return 'أربعمائة وخمسون ريالاً سعودياً فقط لا غير';
  if (num === 3500) return 'ثلاثة آلاف وخمسمائة ريال سعودي فقط لا غير';
  if (num === 7000) return 'سبعة آلاف ريال سعودي فقط لا غير';
  if (num === 21000) return 'واحد وعشرون ألف ريال سعودي فقط لا غير';
  if (num === 42000) return 'اثنان وأربعون ألف ريال سعودي فقط لا غير';

  return `${num} ريالاً سعودياً فقط لا غير`;
}

function getPaymentMethodLabel(method?: PaymentMethod): { label: string; color: string } {
  switch (method) {
    case 'apple_pay':
      return { label: 'Apple Pay (إلكتروني)', color: '#000000' };
    case 'mada':
      return { label: 'بطاقة مدى (إلكتروني)', color: '#059669' };
    case 'credit_card':
      return { label: 'بطاقة ائتمانية (Visa/Master)', color: '#2563eb' };
    case 'cash':
      return { label: 'نقدي (كاش مستلم)', color: '#d97706' };
    case 'pos':
      return { label: 'جهاز نقاط البيع (شبكة POS)', color: '#7c3aed' };
    case 'bank_transfer':
      return { label: 'تحويل بنكي مباشر', color: '#0284c7' };
    default:
      return { label: 'سداد إلكتروني معتمد', color: '#10b981' };
  }
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  contract,
  receipt,
  onSendWhatsAppReceipt
}) => {
  if (!isOpen || !contract) return null;

  const receiptNumber = receipt?.receipt_number || contract.receipt_number || `RCP-${new Date().getFullYear()}-${contract.contract_number.replace(/[^0-9]/g, '') || '8812'}`;
  const paidAmount = Number(receipt?.amount || contract.paid_amount || contract.total_cost);
  const paymentMethod = receipt?.payment_method || contract.payment_method || 'mada';
  const methodInfo = getPaymentMethodLabel(paymentMethod);
  const arabicWords = numberToArabicWords(paidAmount);
  const issueDate = receipt?.issued_at ? new Date(receipt.issued_at) : new Date(contract.updated_at || contract.created_at);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (contract.customer?.phone && onSendWhatsAppReceipt) {
      const msg = `مرحباً ${contract.customer.name}،\nمرفق سند القبض الإلكتروني رقم (${receiptNumber}) الخاص بعقد الحاوية (${contract.contract_number}).\n\nالمبلغ المسدد: ${paidAmount} ر.س (${arabicWords})\nطريقة الدفع: ${methodInfo.label}\n\nشكراً لتعاملكم مع المحترز للحاويات.`;
      onSendWhatsAppReceipt(contract.customer.phone, msg);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          padding: '0', 
          overflow: 'hidden',
          background: '#0a0f1d',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
        }}
      >
        
        {/* Actions Bar (Top) */}
        <div style={{
          padding: '14px 20px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#fbbf24" />
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>
              سند قبض مالي رسمي
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#10b981',
                border: 'none',
                color: '#050811',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              <span>طباعة السند</span>
            </button>

            {contract.customer?.phone && (
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(14, 165, 233, 0.2)',
                  border: '1px solid rgba(14, 165, 233, 0.4)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Share2 size={14} />
                <span>إرسال واتساب</span>
              </button>
            )}

            <button
              onClick={onClose}
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
        </div>

        {/* Printable Official Receipt Body */}
        <div id="printable-receipt" style={{ padding: '30px', background: '#ffffff', color: '#0f172a' }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '20px',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                    مؤسسة المحترز للحاويات
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    تأجير الحاويات التجارية وعقود الأنقاض
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                الرقم الضريبي: <strong>300099887700003</strong> | السجل التجاري: <strong>1010889900</strong>
                <br />
                الرياض - المملكة العربية السعودية | هاتف: 920001234
              </div>
            </div>

            {/* Receipt Badge */}
            <div style={{ textAlign: 'left', direction: 'ltr' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', letterSpacing: '1px' }}>
                  PAYMENT RECEIPT
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  سند قبض
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                  {receiptNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Key Details Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            background: '#f1f5f9',
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '18px 0',
            fontSize: '0.82rem'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>تاريخ وساعة السند:</span>
              <strong style={{ color: '#0f172a' }}>{issueDate.toLocaleDateString('ar-SA')} - {issueDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>رقم العقد المرجعي:</span>
              <strong style={{ color: '#0f172a' }}>{contract.contract_number}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>بيانات الحاوية:</span>
              <strong style={{ color: '#0f172a' }}>
                {contract.container?.container_number || 'حاوية'} ({contract.contract_type === 'commercial' ? 'تجاري' : 'أنقاض'})
              </strong>
            </div>
          </div>

          {/* Receipt Body Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', background: '#f8fafc', fontWeight: '700', width: '30%', color: '#475569' }}>
                    استلمنا من المكرم / السادة:
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: '800', color: '#0f172a' }}>
                    {contract.customer?.name || 'العميل'}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', background: '#f8fafc', fontWeight: '700', color: '#475569' }}>
                    مبلغ وقدره:
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '900',
                        color: '#059669',
                        background: '#ecfdf5',
                        padding: '2px 10px',
                        borderRadius: '6px'
                      }}>
                        {paidAmount.toFixed(2)} ر.س
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                        ({arabicWords})
                      </span>
                    </div>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', background: '#f8fafc', fontWeight: '700', color: '#475569' }}>
                    طريقة السداد:
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      background: '#f1f5f9',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1'
                    }}>
                      <CreditCard size={14} />
                      <span>{methodInfo.label}</span>
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '10px 14px', background: '#f8fafc', fontWeight: '700', color: '#475569' }}>
                    وذلك سداداً عن:
                  </td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>
                    قيمة تأجير حاوية ({contract.contract_type === 'commercial' ? 'تجاري' : 'أنقاض يومي'}) بموقع ({contract.location_address || 'الرياض'}) للفترة من ({new Date(contract.start_date).toLocaleDateString('ar-SA')}) إلى ({new Date(contract.end_date).toLocaleDateString('ar-SA')}).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer & QR Verification Box */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '10px',
            borderTop: '1px dashed #cbd5e1'
          }}>
            {/* QR Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '74px',
                height: '74px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff'
              }}>
                <QrCode size={64} color="#0f172a" />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' }}>
                <strong style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} />
                  <span>سند معتمد وموثق إلكترونياً</span>
                </strong>
                امسح الرمز للتحقق الفوري من صحة السند
              </div>
            </div>

            {/* Stamp / Signature Box */}
            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '30px' }}>
                الختم والاعتماد
              </div>
              <div style={{
                borderTop: '1px solid #0f172a',
                fontSize: '0.75rem',
                color: '#64748b',
                paddingTop: '4px'
              }}>
                قسم المالية والمحصلة
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
