'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  Truck, 
  User, 
  Phone, 
  DollarSign, 
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Container, ContractPeriodType, ContainerType } from '@/types/database';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Container[];
  preSelectedContainerId?: string;
  onSaveContract: (contractData: any) => Promise<boolean>;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  onClose,
  containers,
  preSelectedContainerId,
  onSaveContract
}) => {
  // Form State
  const [contractType, setContractType] = useState<ContainerType>('debris');
  const [periodType, setPeriodType] = useState<ContractPeriodType>('daily');
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');
  
  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+966');
  
  // Dates & Durations
  const [durationDays, setDurationDays] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [pickupDate, setPickupDate] = useState('');
  
  // Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  // Pricing
  const [totalCost, setTotalCost] = useState(150);
  const [paidAmount, setPaidAmount] = useState(150);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter available containers based on type
  const availableContainers = containers.filter(c => 
    c.status === 'available' && c.type === contractType
  );

  // Set pre-selected container if provided
  useEffect(() => {
    if (preSelectedContainerId) {
      const found = containers.find(c => c.id === preSelectedContainerId);
      if (found) {
        setContractType(found.type);
        setSelectedContainerId(found.id);
        if (found.type === 'debris') {
          setTotalCost(found.daily_rate || 150);
          setPaidAmount(found.daily_rate || 150);
        } else {
          setPeriodType('monthly');
          setTotalCost(found.monthly_rate || 3500);
          setPaidAmount(found.monthly_rate || 3500);
        }
      }
    }
  }, [preSelectedContainerId, containers]);

  // Adjust duration & pickup date default when startDate or durationDays change
  useEffect(() => {
    if (contractType === 'debris') {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
      setPickupDate(end.toISOString().slice(0, 16));
    } else {
      const start = new Date(startDate);
      let months = 1;
      if (periodType === 'semi_annual') months = 6;
      if (periodType === 'annual') months = 12;
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      setPickupDate(end.toISOString().slice(0, 16));
    }
  }, [contractType, periodType, durationDays, startDate]);

  // Auto calculate cost on container/period change
  useEffect(() => {
    const cont = containers.find(c => c.id === selectedContainerId);
    if (cont) {
      if (contractType === 'debris') {
        const cost = (cont.daily_rate || 150) * durationDays;
        setTotalCost(cost);
        setPaidAmount(cost);
      } else {
        const monthly = cont.monthly_rate || 3500;
        let mult = 1;
        if (periodType === 'semi_annual') mult = 6;
        if (periodType === 'annual') mult = 12;
        const cost = monthly * mult;
        setTotalCost(cost);
        setPaidAmount(cost);
      }
    }
  }, [selectedContainerId, contractType, periodType, durationDays, containers]);

  // GPS Location Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setGoogleMapsUrl(mapUrl);
        setIsLocating(false);
      },
      (error) => {
        alert('تعذر تحديد الموقع تلقائياً. يمكنك لصق رابط خرائط جوجل يدوياً.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContainerId) {
      alert('يرجى اختيار الحاوية المتاحة.');
      return;
    }
    if (!customerName || !customerPhone || customerPhone.length < 9) {
      alert('يرجى إدخال اسم العميل ورقم جوال الواتساب بشكل صحيح.');
      return;
    }

    setIsSaving(true);
    const contractNumber = `CTR-${Date.now().toString().slice(-5)}`;
    
    const payload = {
      contract_number: contractNumber,
      contract_type: contractType,
      period_type: periodType,
      duration_days: durationDays,
      container_id: selectedContainerId,
      customer_name: customerName,
      customer_phone: customerPhone,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(pickupDate).toISOString(),
      expected_pickup_time: new Date(pickupDate).toISOString(),
      location_latitude: latitude,
      location_longitude: longitude,
      google_maps_url: googleMapsUrl,
      location_address: locationAddress,
      total_cost: totalCost,
      paid_amount: paidAmount,
      notes: notes
    };

    const success = await onSaveContract(payload);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '30px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={22} color="#050811" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
                تسجيل عقد حاوية جديد
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                إدخال بيانات العقد، تحديد الموقع عبر GPS، وجدولة تنبيهات الواتساب التلقائية
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Category Selection: Commercial vs Debris */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px', color: '#fbbf24' }}>
              نوع العقد والحاوية:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                id="select-type-debris"
                onClick={() => {
                  setContractType('debris');
                  setPeriodType('daily');
                  setSelectedContainerId('');
                }}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid',
                  borderColor: contractType === 'debris' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                  background: contractType === 'debris' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                  color: contractType === 'debris' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: contractType === 'debris' ? '#fbbf24' : '#e2e8f0' }}>
                  حاوية أنقاض (يومي)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  مخلفات بناء وترميم مع تحديد موعد السحب
                </div>
              </button>

              <button
                type="button"
                id="select-type-commercial"
                onClick={() => {
                  setContractType('commercial');
                  setPeriodType('monthly');
                  setSelectedContainerId('');
                }}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid',
                  borderColor: contractType === 'commercial' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                  background: contractType === 'commercial' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                  color: contractType === 'commercial' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: contractType === 'commercial' ? '#a5b4fc' : '#e2e8f0' }}>
                  حاوية تجارية
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  عقود دورية (شهري / نصف سنوي / سنوي)
                </div>
              </button>
            </div>
          </div>

          {/* 2. Container Selector & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                اختيار رقم الحاوية المتاحة:
              </label>
              <select
                id="contract-container-select"
                className="form-select"
                value={selectedContainerId}
                onChange={(e) => setSelectedContainerId(e.target.value)}
                required
              >
                <option value="">-- اختر الحاوية --</option>
                {availableContainers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.container_number} ({c.type === 'commercial' ? 'تجاري' : 'أنقاض'}) - {c.type === 'debris' ? `${c.daily_rate} ر.س/يوم` : `${c.monthly_rate} ر.س/شهر`}
                  </option>
                ))}
              </select>
              {availableContainers.length === 0 && (
                <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '4px' }}>
                  ⚠️ لا توجد حاويات متاحة حالياً من هذا النوع.
                </div>
              )}
            </div>

            {contractType === 'debris' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  مدة العقد (عدد الأيام):
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  فترة العقد التجاري:
                </label>
                <select
                  className="form-select"
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as ContractPeriodType)}
                >
                  <option value="monthly">شهري (1 شهر)</option>
                  <option value="semi_annual">نصف سنوي (6 أشهر)</option>
                  <option value="annual">سنوي (12 شهر)</option>
                </select>
              </div>
            )}
          </div>

          {/* 3. Customer Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                اسم العميل / المؤسسة:
              </label>
              <input
                id="contract-customer-name"
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: مؤسسة الأفق / خالد العتيبي"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                رقم الجوال (واتساب):
              </label>
              <input
                id="contract-customer-phone"
                type="tel"
                className="form-input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+966500000000"
                style={{ direction: 'ltr', textAlign: 'left' }}
                required
              />
            </div>
          </div>

          {/* 4. Dates & Expected Pickup */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                تاريخ ووقت التنزيل:
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                {contractType === 'debris' ? 'تاريخ ووقت السحب المتوقع:' : 'تاريخ نهاية العقد:'}
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 5. Location with GPS and Maps */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0' }}>
                الموقع الجغرافي وخريطة التوصيل:
              </label>
              <button
                type="button"
                id="btn-get-gps-location"
                onClick={handleGetCurrentLocation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(14, 165, 233, 0.2)',
                  border: '1px solid rgba(14, 165, 233, 0.4)',
                  color: '#38bdf8',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Navigation size={13} />
                <span>{isLocating ? 'جارٍ تحديد الموقع...' : 'تحديد موقعي الآن عبر GPS'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="رابط خرائط جوجل (Google Maps Link) أو اتركه ليتولد من GPS"
                style={{ direction: 'ltr', textAlign: 'left', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                className="form-input"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="وصف الحي أو الشارع (مثال: حي النرجس - شارع 15)"
              />
            </div>
            {latitude && longitude && (
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                <span>تم التقاط الإحداثيات: {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* 6. Pricing & Payments */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                التكلفة الإجمالية:
              </label>
              <input
                type="number"
                className="form-input"
                value={totalCost}
                onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                style={{ fontWeight: '800', color: '#fbbf24' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                المبلغ المدفوع:
              </label>
              <input
                type="number"
                className="form-input"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                style={{ fontWeight: '800', color: '#34d399' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                المبلغ المتبقي:
              </label>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '1rem',
                color: (totalCost - paidAmount) > 0 ? '#f87171' : '#34d399'
              }}>
                {(totalCost - paidAmount)} ر.س
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              إلغاء
            </button>
            <button
              id="submit-contract-btn"
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{ minWidth: '160px' }}
            >
              {isSaving ? 'جارٍ الحفظ والجدولة...' : 'توثيق وحفظ العقد'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
