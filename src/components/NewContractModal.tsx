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
  AlertTriangle,
  UserCheck,
  CreditCard,
  Banknote,
  Hourglass
} from 'lucide-react';
import { Container, ContractPeriodType, ContainerType, Profile, PaymentMethod } from '@/types/database';

export type PaymentChoice = 'cash' | 'sadad' | 'postpaid';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Container[];
  staffList?: Profile[];
  preSelectedContainerId?: string;
  onSaveContract: (contractData: any) => Promise<boolean>;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  onClose,
  containers,
  staffList = [],
  preSelectedContainerId,
  onSaveContract
}) => {
  // Form State
  const [contractType, setContractType] = useState<ContainerType>('debris');
  const [periodType, setPeriodType] = useState<ContractPeriodType>('daily');
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>('');
  
  // Mandatory Payment Choice: 'cash' (نقدي فوري) | 'sadad' (إلكتروني Apple Pay/مدى) | 'postpaid' (آجل لاحقاً)
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('cash');

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+9665');
  
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

  // Filter drivers / staff for selector
  const activeStaff = staffList.filter(s => s.is_active);

  // Default select first driver if available
  useEffect(() => {
    if (activeStaff.length > 0 && !assignedEmployeeId) {
      const driver = activeStaff.find(s => s.full_name.includes('سائق')) || activeStaff[0];
      if (driver) setAssignedEmployeeId(driver.id);
    }
  }, [activeStaff, assignedEmployeeId]);

  // Set pre-selected container if provided
  useEffect(() => {
    if (preSelectedContainerId) {
      const found = containers.find(c => c.id === preSelectedContainerId);
      if (found) {
        setContractType(found.type);
        setSelectedContainerId(found.id);
        if (found.type === 'debris') {
          const cost = found.daily_rate || 150;
          setTotalCost(cost);
          if (paymentChoice === 'cash') setPaidAmount(cost);
          else setPaidAmount(0);
        } else {
          setPeriodType('monthly');
          const cost = found.monthly_rate || 3500;
          setTotalCost(cost);
          if (paymentChoice === 'cash') setPaidAmount(cost);
          else setPaidAmount(0);
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
      let cost = 150;
      if (contractType === 'debris') {
        cost = (cont.daily_rate || 150) * durationDays;
      } else {
        const monthly = cont.monthly_rate || 3500;
        let mult = 1;
        if (periodType === 'semi_annual') mult = 6;
        if (periodType === 'annual') mult = 12;
        cost = monthly * mult;
      }
      setTotalCost(cost);
      if (paymentChoice === 'cash') {
        setPaidAmount(cost);
      } else {
        setPaidAmount(0);
      }
    }
  }, [selectedContainerId, contractType, periodType, durationDays, containers, paymentChoice]);

  // Handle Payment Choice Change
  const handlePaymentChoiceChange = (choice: PaymentChoice) => {
    setPaymentChoice(choice);
    if (choice === 'cash') {
      setPaidAmount(totalCost);
    } else {
      setPaidAmount(0);
    }
  };

  // Fetch Current Device GPS Location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setGoogleMapsUrl(mapsUrl);
        setLocationAddress(`إحداثيات الموقع المباشر: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('تعذر تحديد الموقع الجغرافي: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleContractTypeChange = (type: ContainerType) => {
    setContractType(type);
    setSelectedContainerId('');
    if (type === 'debris') {
      setPeriodType('daily');
      setDurationDays(1);
      setTotalCost(150);
      setPaidAmount(paymentChoice === 'cash' ? 150 : 0);
    } else {
      setPeriodType('monthly');
      setTotalCost(3500);
      setPaidAmount(paymentChoice === 'cash' ? 3500 : 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContainerId) {
      alert('يرجى اختيار الحاوية المطلوبة.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('يرجى إدخال اسم العميل ورقم الجوال.');
      return;
    }

    setIsSaving(true);
    const contractNumber = `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const contractPayload = {
      contract_number: contractNumber,
      container_id: selectedContainerId,
      assigned_employee_id: assignedEmployeeId || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      contract_type: contractType,
      period_type: periodType,
      duration_days: durationDays,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(pickupDate).toISOString(),
      expected_pickup_time: new Date(pickupDate).toISOString(),
      location_latitude: latitude,
      location_longitude: longitude,
      google_maps_url: googleMapsUrl,
      location_address: locationAddress,
      total_cost: totalCost,
      paid_amount: paymentChoice === 'cash' ? totalCost : paidAmount,
      payment_choice: paymentChoice,
      notes: notes
    };

    const success = await onSaveContract(contractPayload);
    setIsSaving(false);

    if (success) {
      onClose();
      // Reset form
      setCustomerName('');
      setCustomerPhone('+9665');
      setSelectedContainerId('');
      setGoogleMapsUrl('');
      setLocationAddress('');
      setPaymentChoice('cash');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={24} color="var(--accent-gold)" />
              <span>توثيق وحجز عقد حاوية جديد</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              إدخال بيانات العقد، تحديد السائق، واختيار طريقة السداد المعتمدة
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. Contract Type Selector (Commercial vs Debris Only) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: '#e2e8f0' }}>
              1. نوع الحاوية والعقد المطلوب:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Debris Daily */}
              <div
                onClick={() => handleContractTypeChange('debris')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: `2px solid ${contractType === 'debris' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: contractType === 'debris' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: contractType === 'debris' ? '#38bdf8' : '#ffffff' }}>
                    حاوية أنقاض ومخلفات 🏗️
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#38bdf8', color: '#050811', fontWeight: 800 }}>
                    عقد يومي
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  تأجير يومي للبناء والترميم، مع تنبيه آلي قبل 4 ساعات من السحب.
                </div>
              </div>

              {/* Commercial Recurring */}
              <div
                onClick={() => handleContractTypeChange('commercial')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: `2px solid ${contractType === 'commercial' ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: contractType === 'commercial' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: contractType === 'commercial' ? '#fbbf24' : '#ffffff' }}>
                    حاوية تجارية للمنشآت 🏢
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#f59e0b', color: '#050811', fontWeight: 800 }}>
                    شهري / سنوي
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  عقود دورية للمنشآت، مع تنبيهات تجديد قبل 7 أيام ويومين.
                </div>
              </div>
            </div>
          </div>

          {/* 2. Container Selector & Responsible Staff / Driver Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Container */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                2. الحاوية المتاحة للتأجير:
              </label>
              <select
                className="form-select"
                value={selectedContainerId}
                onChange={(e) => setSelectedContainerId(e.target.value)}
                required
              >
                <option value="">-- اختر حاوية ({availableContainers.length} متاحة) --</option>
                {availableContainers.map(cont => (
                  <option key={cont.id} value={cont.id}>
                    {cont.container_number} — {contractType === 'debris' ? `${cont.daily_rate} ر.س/يوم` : `${cont.monthly_rate} ر.س/شهر`}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsible Driver / Staff Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#34d399' }}>
                3. المسؤول (سائق التوصيل 🚛 / موظف المتابعة 👷):
              </label>
              <select
                className="form-select"
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}
              >
                <option value="">-- اختر السائق أو الموظف --</option>
                {activeStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name} ({staff.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Customer Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                اسم العميل أو المقاول:
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingRight: '36px' }}
                  placeholder="مثال: مؤسسة صروح البناء / أحمد العتيبي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                رقم جوال العميل (للواتساب والسداد):
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  className="form-input"
                  style={{ paddingRight: '36px', direction: 'ltr', textAlign: 'left' }}
                  placeholder="+9665XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. Dates & Durations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {contractType === 'debris' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                  عدد الأيام (يومي):
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#fbbf24' }}>
                موعد السحب المتوقع:
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

          {/* 5. GPS Location & Google Maps */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0' }}>
                الموقع الجغرافي ورابط خرائط Google:
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'جارٍ التحديد...' : 'تحديد موقعي الحالي عبر GPS'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="رابط خرائط جوجل (Google Maps URL)..."
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="وصف الحي أو العنوان (مثال: حي الملقا - شارع 15)"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
              />
            </div>
          </div>

          {/* 6. Pricing Summary Strip (القيمة الإجمالية والمبلغ المتبقي) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>إجمالي تكلفة العقد</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fbbf24' }}>
                {totalCost} ر.س
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>المبلغ المدفوع الآن</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: paymentChoice === 'cash' ? '#34d399' : '#38bdf8' }}>
                {paymentChoice === 'cash' ? totalCost : paidAmount} ر.س
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>المتبقي المطلوب</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: paymentChoice === 'cash' ? '#34d399' : '#f87171' }}>
                {paymentChoice === 'cash' ? 0 : totalCost} ر.س
              </div>
            </div>
          </div>

          {/* 7. Mandatory Payment Method Matrices (تحت القيمة الإجمالية والمتبقي وقبل التوثيق) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '2px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            padding: '16px 20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={18} />
                <span>طريقة وآلية السداد المعتمدة للعقد (حدد قبل التوثيق):</span>
              </label>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700 }}>
                مطلوب
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              
              {/* Choice 1: Cash */}
              <div
                onClick={() => handlePaymentChoiceChange('cash')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${paymentChoice === 'cash' ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: paymentChoice === 'cash' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(2, 6, 23, 0.6)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Banknote size={24} color={paymentChoice === 'cash' ? '#34d399' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: paymentChoice === 'cash' ? '#34d399' : '#ffffff' }}>
                  💵 كاش (سداد فوري)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  مدفوع بالكامل + إصدار سند
                </div>
              </div>

              {/* Choice 2: Sadad Electronic Link */}
              <div
                onClick={() => handlePaymentChoiceChange('sadad')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${paymentChoice === 'sadad' ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: paymentChoice === 'sadad' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(2, 6, 23, 0.6)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <CreditCard size={24} color={paymentChoice === 'sadad' ? '#fbbf24' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: paymentChoice === 'sadad' ? '#fbbf24' : '#ffffff' }}>
                  💳 سداد (إلكتروني)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  رابط Apple Pay / مدى بالواتساب
                </div>
              </div>

              {/* Choice 3: Postpaid / Later */}
              <div
                onClick={() => handlePaymentChoiceChange('postpaid')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${paymentChoice === 'postpaid' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: paymentChoice === 'postpaid' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(2, 6, 23, 0.6)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Hourglass size={24} color={paymentChoice === 'postpaid' ? '#38bdf8' : '#94a3b8'} style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: paymentChoice === 'postpaid' ? '#38bdf8' : '#ffffff' }}>
                  ⏳ آجل (تحصيل لاحقاً)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  دفع عند التنزيل أو السحب
                </div>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{ minWidth: '220px', padding: '10px 24px', fontSize: '0.95rem' }}
            >
              {isSaving ? 'جارٍ توثيق العقد...' : `توثيق العقد (${paymentChoice === 'cash' ? 'كاش وسند فوري' : paymentChoice === 'sadad' ? 'إرسال رابط سداد' : 'تسجيل كآجل'})`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
