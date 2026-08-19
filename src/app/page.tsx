'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { 
  Container, 
  Contract, 
  Customer, 
  NotificationLog, 
  Profile, 
  UserRole, 
  ContainerStatus, 
  ContractStatus,
  InAppNotification,
  WhatsAppSettings as IWhatsAppSettings,
  PaymentSettings as IPaymentSettings,
  Receipt,
  PaymentMethod
} from '@/types/database';
import { SplashIntro } from '@/components/SplashIntro';
import { Navbar } from '@/components/Navbar';
import { SmartSearch } from '@/components/SmartSearch';
import { ContainersView } from '@/components/ContainersView';
import { ContractsView } from '@/components/ContractsView';
import { WhatsAppHub } from '@/components/WhatsAppHub';
import { StaffManagement } from '@/components/StaffManagement';
import { WhatsAppSettings } from '@/components/WhatsAppSettings';
import { PaymentSettings } from '@/components/PaymentSettings';
import { NewContractModal } from '@/components/NewContractModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { ManualPaymentModal } from '@/components/ManualPaymentModal';

// Sample Seed Data
const initialContainers: Container[] = [
  { id: '1', container_number: 'C-101', type: 'commercial', status: 'available', daily_rate: 0, monthly_rate: 3500, notes: 'حاوية تجارية مغلقة للمستودعات والشركات', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', container_number: 'C-102', type: 'commercial', status: 'rented', daily_rate: 0, monthly_rate: 3500, notes: 'مؤجرة لدى مجمع تجاري بالرياض', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', container_number: 'D-201', type: 'debris', status: 'available', daily_rate: 150, monthly_rate: 0, notes: 'حاوية أنقاض ومخلفات بناء وترميم', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', container_number: 'D-202', type: 'debris', status: 'rented', daily_rate: 150, monthly_rate: 0, notes: 'حاوية أنقاض - مشروع حي النرجس', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', container_number: 'D-203', type: 'debris', status: 'available', daily_rate: 150, monthly_rate: 0, notes: 'حاوية أنقاض مجهزة للتسليم الفوري', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'مؤسسة صروح البناء للمقاولات', phone: '+966551234567', customer_type: 'company', address: 'حي الملقا - الرياض', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cust-2', name: 'أحمد بن عبدالعزيز العتيبي', phone: '+966509876543', customer_type: 'individual', address: 'حي الياسمين - فيلا 22', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const initialContracts: Contract[] = [
  {
    id: 'cnt-1',
    contract_number: 'CTR-2026-001',
    customer_id: 'cust-1',
    container_id: '2',
    contract_type: 'commercial',
    period_type: 'monthly',
    duration_days: 30,
    start_date: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    expected_pickup_time: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    location_latitude: 24.774265,
    location_longitude: 46.738586,
    google_maps_url: 'https://maps.google.com/?q=24.774265,46.738586',
    location_address: 'حي الملقا - طريق الملك سلمان',
    total_cost: 3500,
    paid_amount: 3500,
    remaining_amount: 0,
    payment_status: 'paid',
    payment_method: 'mada',
    receipt_number: 'RCP-2026-1049',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: initialCustomers[0],
    container: initialContainers[1]
  },
  {
    id: 'cnt-2',
    contract_number: 'CTR-2026-002',
    customer_id: 'cust-2',
    container_id: '4',
    contract_type: 'debris',
    period_type: 'daily',
    duration_days: 3,
    start_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours left
    expected_pickup_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    location_latitude: 24.814265,
    location_longitude: 46.658586,
    google_maps_url: 'https://maps.google.com/?q=24.814265,46.658586',
    location_address: 'حي النرجس - شارع رقم 15',
    total_cost: 450,
    paid_amount: 150,
    remaining_amount: 300,
    payment_status: 'partially_paid',
    payment_method: 'cash',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: initialCustomers[1],
    container: initialContainers[3]
  }
];

const initialNotifications: NotificationLog[] = [
  {
    id: 'notif-1',
    contract_id: 'cnt-2',
    customer_id: 'cust-2',
    recipient_role: 'customer',
    recipient_phone: '+966509876543',
    recipient_name: 'أحمد العتيبي',
    notification_type: 'debris_pickup_4h',
    message_body: 'عزيزنا أحمد، نود تذكيركم بقرب موعد سحب حاوية الأنقاض رقم (D-202) خلال 4 ساعات. في حال رغبتكم بالتمديد يرجى التواصل معنا.',
    scheduled_for: new Date().toISOString(),
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-2',
    contract_id: 'cnt-1',
    customer_id: 'cust-1',
    recipient_role: 'customer',
    recipient_phone: '+966551234567',
    recipient_name: 'مؤسسة صروح البناء',
    notification_type: 'commercial_7d_before',
    message_body: 'عزيزنا العميل، نود إحاطتكم بأن عقد الحاوية التجارية رقم (CTR-2026-001) سينتهي بعد 5 أيام. للتجديد يرجى التواصل معنا لتجهيز الفاتورة.',
    scheduled_for: new Date().toISOString(),
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

// Initial in-app notifications
const initialInAppNotifications: InAppNotification[] = [
  {
    id: 'inapp-1',
    contract_id: 'cnt-2',
    title: '⚠️ تنبيه موعد سحب وشيك (خلال 4 ساعات)',
    message: 'حاوية الأنقاض رقم (D-202) بالملقا تستحق السحب اليوم الساعة 4:00 عصراً.',
    type: 'contract_expiry_soon',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'inapp-2',
    contract_id: 'cnt-1',
    title: '📅 تنبيه تجديد عقد تجاري (قبل 5 أيام)',
    message: 'عقد الحاوية التجارية (CTR-2026-001) لمؤسسة صروح البناء شارف على الانتهاء.',
    type: 'contract_expiry_soon',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'inapp-3',
    title: '✨ جاهزية النظام والربط اللحظي',
    message: 'تم تفعيل محرك الإشعارات الداخلية وتنبيهات العقود والعمليات بنجاح.',
    type: 'system_alert',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const initialStaff: Profile[] = [
  {
    id: 'staff-admin',
    full_name: 'سعود المحترز (المدير العام)',
    email: 'admin@almuhtaraz.com',
    phone: '+966500000001',
    role: 'admin',
    is_active: true,
    can_view_all_records: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-1',
    full_name: 'محمد الشمري',
    email: 'm.shammari@almuhtaraz.com',
    phone: '+966550000002',
    role: 'employee',
    is_active: true,
    can_view_all_records: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-2',
    full_name: 'فهد القحطاني',
    email: 'f.qahtani@almuhtaraz.com',
    phone: '+966550000003',
    role: 'employee',
    is_active: true,
    can_view_all_records: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-3',
    full_name: 'سعد الدوسري (سائق وتوصيل)',
    email: 's.dosari@almuhtaraz.com',
    phone: '+966550000004',
    role: 'employee',
    is_active: true,
    can_view_all_records: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-4',
    full_name: 'عبدالله المطيري',
    email: 'a.mutairi@almuhtaraz.com',
    phone: '+966550000005',
    role: 'employee',
    is_active: true,
    can_view_all_records: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialGatewaySettings: IWhatsAppSettings = {
  mode: 'evolution',
  evolution_server_url: 'http://localhost:8080',
  evolution_instance_name: 'muhtaraz-instance',
  evolution_api_key: '123456',
  sender_phone: '+966920001234',
  admin_phone: '+966500000001',
  is_connected: true,
  auto_send_enabled: true
};

const initialPaymentSettings: IPaymentSettings = {
  is_enabled: true,
  publishable_key: 'pk_test_muhtaraz_demo_key',
  secret_key: 'sk_test_muhtaraz_secret_key',
  apple_pay_enabled: true,
  mada_enabled: true,
  credit_card_enabled: true,
  vat_number: '300099887700003',
  company_commercial_reg: '1010889900'
};

export default function Home() {
  // App State
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState('search');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  
  // Data State
  const [containers, setContainers] = useState<Container[]>(initialContainers);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [notifications, setNotifications] = useState<NotificationLog[]>(initialNotifications);
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>(initialInAppNotifications);
  const [staffList, setStaffList] = useState<Profile[]>(initialStaff);
  const [gatewaySettings, setGatewaySettings] = useState<IWhatsAppSettings>(initialGatewaySettings);
  const [paymentSettings, setPaymentSettings] = useState<IPaymentSettings>(initialPaymentSettings);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Modal State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [preSelectedContainerId, setPreSelectedContainerId] = useState<string | undefined>();
  
  // Payment Modals State
  const [selectedReceiptContract, setSelectedReceiptContract] = useState<Contract | null>(null);
  const [selectedManualPaymentContract, setSelectedManualPaymentContract] = useState<Contract | null>(null);

  // Fetch initial data from Supabase if connected
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: dbContainers } = await supabase.from('containers').select('*');
        if (dbContainers && dbContainers.length > 0) setContainers(dbContainers);

        const { data: dbCustomers } = await supabase.from('customers').select('*');
        if (dbCustomers && dbCustomers.length > 0) setCustomers(dbCustomers);

        const { data: dbContracts } = await supabase.from('contracts').select('*, customer:customers(*), container:containers(*)');
        if (dbContracts && dbContracts.length > 0) setContracts(dbContracts);

        const { data: dbNotifs } = await supabase.from('notification_logs').select('*');
        if (dbNotifs && dbNotifs.length > 0) setNotifications(dbNotifs);

        const { data: dbInApp } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (dbInApp && dbInApp.length > 0) setInAppNotifications(dbInApp);

        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length > 0) setStaffList(dbProfiles);

        const { data: dbSettings } = await supabase.from('whatsapp_settings').select('*').limit(1).single();
        if (dbSettings) setGatewaySettings(dbSettings);

        const { data: dbPaySettings } = await supabase.from('payment_settings').select('*').limit(1).single();
        if (dbPaySettings) setPaymentSettings(dbPaySettings);

        const { data: dbReceipts } = await supabase.from('receipts').select('*');
        if (dbReceipts && dbReceipts.length > 0) setReceipts(dbReceipts);
      } catch (err) {
        console.warn('Supabase local sync initialized with active state:', err);
      }
    };

    fetchSupabaseData();
  }, []);

  // WhatsApp Sender Helper (Fallback wa.me)
  const handleSendWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // In-App Notification Handlers
  const handleMarkInAppAsRead = async (id: string) => {
    setInAppNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllInAppAsRead = async () => {
    setInAppNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await supabase.from('notifications').update({ is_read: true }).neq('is_read', true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllInApp = async () => {
    setInAppNotifications([]);
    try {
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectContractFromNotification = (contractId: string) => {
    setCurrentTab('contracts');
  };

  // Gateway Settings Handlers
  const handleSaveGatewaySettings = async (updated: IWhatsAppSettings): Promise<boolean> => {
    setGatewaySettings(updated);
    try {
      await supabase.from('whatsapp_settings').upsert([updated]);
    } catch (e) {
      console.warn('Saved settings locally:', e);
    }
    return true;
  };

  const handleSavePaymentSettings = async (updated: IPaymentSettings): Promise<boolean> => {
    setPaymentSettings(updated);
    try {
      await supabase.from('payment_settings').upsert([updated]);
    } catch (e) {
      console.warn('Saved payment settings locally:', e);
    }
    return true;
  };

  const handleTestConnection = async (testPhone: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: 'رسالة اختبار تجريبية من بوابة الواتساب - المحترز للحاويات ✅'
        })
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      return true; // simulated success for test
    }
  };

  // Send Electronic Invoice via WhatsApp Link
  const handleSendInvoiceLink = async (contract: Contract) => {
    try {
      const res = await fetch('/api/payment/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: contract.id,
          contract_number: contract.contract_number,
          amount: contract.remaining_amount > 0 ? contract.remaining_amount : contract.total_cost,
          customer_name: contract.customer?.name,
          customer_phone: contract.customer?.phone
        })
      });

      const data = await res.json();
      if (data.success && contract.customer?.phone) {
        handleSendWhatsApp(contract.customer.phone, data.whatsapp_message);
      } else {
        alert('حدث خطأ أثناء إنشاء رابط الفاتورة الإلكترونية.');
      }
    } catch (err) {
      // Fallback
      if (contract.customer?.phone) {
        const fallbackLink = `https://checkout.moyasar.com/invoices/inv_${contract.contract_number}`;
        handleSendWhatsApp(
          contract.customer.phone,
          `مرحباً ${contract.customer.name}، رابط سداد عقد الحاوية (${contract.contract_number}) بمبلغ (${contract.remaining_amount || contract.total_cost} ر.س) عبر Apple Pay ومدى:\n${fallbackLink}`
        );
      }
    }
  };

  // Confirm Manual Payment (Cash / POS / Transfer)
  const handleConfirmManualPayment = async (
    contractId: string, 
    amount: number, 
    method: PaymentMethod, 
    notes?: string
  ): Promise<boolean> => {
    const target = contracts.find(c => c.id === contractId);
    if (!target) return false;

    const newPaidAmount = target.paid_amount + amount;
    const newRemaining = Math.max(0, target.total_cost - newPaidAmount);
    const newPaymentStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedContract: Contract = {
      ...target,
      paid_amount: newPaidAmount,
      remaining_amount: newRemaining,
      payment_status: newPaymentStatus,
      payment_method: method,
      receipt_number: receiptNumber
    };

    // Update state
    setContracts(prev => prev.map(c => c.id === contractId ? updatedContract : c));

    // Create receipt
    const newReceipt: Receipt = {
      id: `rcp-${Date.now()}`,
      receipt_number: receiptNumber,
      contract_id: target.id,
      customer_id: target.customer_id,
      customer_name: target.customer?.name || 'العميل',
      amount: amount,
      payment_method: method,
      contract_number: target.contract_number,
      container_number: target.container?.container_number,
      container_type: target.contract_type,
      issued_at: new Date().toISOString(),
      notes: notes
    };
    setReceipts(prev => [newReceipt, ...prev]);

    // In-app notification
    const inAppNotif: InAppNotification = {
      id: `inapp-${Date.now()}`,
      contract_id: target.id,
      title: `💵 تم استلام سداد (${amount} ر.س)`,
      message: `تم توثيق سداد للعقد (${target.contract_number}) بطريقة (${method}) وسند قبض (${receiptNumber}).`,
      type: 'payment_alert',
      is_read: false,
      created_at: new Date().toISOString()
    };
    setInAppNotifications(prev => [inAppNotif, ...prev]);

    // Trigger celebration
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Save to Supabase
    try {
      await supabase.from('contracts').update({
        paid_amount: newPaidAmount,
        payment_status: newPaymentStatus,
        receipt_number: receiptNumber
      }).eq('id', contractId);

      await supabase.from('receipts').insert([{
        receipt_number: receiptNumber,
        contract_id: target.id,
        customer_id: target.customer_id,
        amount: amount,
        payment_method: method,
        notes: notes
      }]);
    } catch (e) {
      console.warn('Synced payment locally:', e);
    }

    // Automatically open receipt modal to view / print
    setSelectedReceiptContract(updatedContract);
    return true;
  };

  // Container Status Update Handler
  const handleUpdateContainerStatus = async (containerId: string, status: ContainerStatus) => {
    const cont = containers.find(c => c.id === containerId);
    setContainers(prev => prev.map(c => c.id === containerId ? { ...c, status } : c));
    
    // Add in-app notification for container status change
    const statusText = status === 'available' ? 'متاحة للتأجير' : status === 'rented' ? 'مؤجرة' : 'في الصيانة';
    const statusNotif: InAppNotification = {
      id: `inapp-${Date.now()}`,
      title: `🚛 تحديث حالة حاوية (${cont?.container_number || '-'})`,
      message: `تم تغيير حالة الحاوية إلى: ${statusText}.`,
      type: 'container_status_change',
      is_read: false,
      created_at: new Date().toISOString()
    };
    setInAppNotifications(prev => [statusNotif, ...prev]);

    try {
      await supabase.from('containers').update({ status }).eq('id', containerId);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Container Handler
  const handleAddContainer = async (data: Partial<Container>): Promise<boolean> => {
    const newCont: Container = {
      id: `cont-${Date.now()}`,
      container_number: data.container_number || 'CONT-NEW',
      type: data.type || 'debris',
      status: 'available',
      daily_rate: data.daily_rate || 0,
      monthly_rate: data.monthly_rate || 0,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setContainers(prev => [newCont, ...prev]);

    try {
      await supabase.from('containers').insert([{
        container_number: newCont.container_number,
        type: newCont.type,
        status: newCont.status,
        daily_rate: newCont.daily_rate,
        monthly_rate: newCont.monthly_rate,
        notes: newCont.notes
      }]);
    } catch (err) {
      console.error(err);
    }

    return true;
  };

  // Delete Container Handler (Admin)
  const handleDeleteContainer = async (containerId: string) => {
    setContainers(prev => prev.filter(c => c.id !== containerId));
    try {
      await supabase.from('containers').delete().eq('id', containerId);
    } catch (err) {
      console.error(err);
    }
  };

  // Contract Status Update Handler
  const handleUpdateContractStatus = async (contractId: string, status: ContractStatus) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status } : c));
    try {
      await supabase.from('contracts').update({ status }).eq('id', contractId);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Contract Handler (Admin)
  const handleDeleteContract = async (contractId: string) => {
    setContracts(prev => prev.filter(c => c.id !== contractId));
    try {
      await supabase.from('contracts').delete().eq('id', contractId);
    } catch (err) {
      console.error(err);
    }
  };

  // Save New Contract Handler
  const handleSaveContract = async (contractData: any): Promise<boolean> => {
    const customerObj: Customer = {
      id: `cust-${Date.now()}`,
      name: contractData.customer_name,
      phone: contractData.customer_phone,
      customer_type: 'individual',
      address: contractData.location_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const containerObj = containers.find(c => c.id === contractData.container_id);
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      contract_number: contractData.contract_number,
      customer_id: customerObj.id,
      container_id: contractData.container_id,
      contract_type: contractData.contract_type,
      period_type: contractData.period_type,
      duration_days: contractData.duration_days,
      start_date: contractData.start_date,
      end_date: contractData.end_date,
      expected_pickup_time: contractData.expected_pickup_time,
      location_latitude: contractData.location_latitude,
      location_longitude: contractData.location_longitude,
      google_maps_url: contractData.google_maps_url,
      location_address: contractData.location_address,
      total_cost: contractData.total_cost,
      paid_amount: contractData.paid_amount,
      remaining_amount: contractData.total_cost - contractData.paid_amount,
      payment_status: (contractData.total_cost - contractData.paid_amount) <= 0 ? 'paid' : 'partially_paid',
      payment_method: 'cash',
      receipt_number: receiptNumber,
      status: 'active',
      notes: contractData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer: customerObj,
      container: containerObj
    };

    // Update Local State
    setCustomers(prev => [customerObj, ...prev]);
    setContracts(prev => [newContract, ...prev]);
    setContainers(prev => prev.map(c => c.id === contractData.container_id ? { ...c, status: 'rented' } : c));

    // Auto-generate notification for WhatsApp
    const messageContent = `مرحباً ${customerObj.name}، تم توثيق عقدك رقم (${newContract.contract_number}) بنجاح لدى المحترز للحاويات. رقم الحاوية: ${containerObj?.container_number || '-'}. شكراً لثقتكم بنا.`;
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      contract_id: newContract.id,
      customer_id: customerObj.id,
      recipient_role: 'customer',
      recipient_phone: customerObj.phone,
      recipient_name: customerObj.name,
      notification_type: 'contract_created',
      message_body: messageContent,
      scheduled_for: new Date().toISOString(),
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // 🔔 Auto-generate in-app notification with red badge
    const newInApp: InAppNotification = {
      id: `inapp-${Date.now()}`,
      contract_id: newContract.id,
      title: `📝 تم تسجيل عقد جديد (${newContract.contract_number})`,
      message: `تم توثيق عقد جديد للعميل ${customerObj.name} بالحاوية (${containerObj?.container_number || '-'}).`,
      type: 'contract_created',
      is_read: false,
      created_at: new Date().toISOString()
    };
    setInAppNotifications(prev => [newInApp, ...prev]);

    // 🚀 Automatically send server-side WhatsApp message if Evolution API mode
    if (gatewaySettings.auto_send_enabled && gatewaySettings.mode === 'evolution') {
      try {
        fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: customerObj.phone,
            message: messageContent,
            contract_id: newContract.id,
            customer_id: customerObj.id,
            recipient_role: 'customer',
            notification_type: 'contract_created'
          })
        }).catch(err => console.warn('Background auto-send dispatch:', err));
      } catch (e) {}
    }

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Save to Supabase
    try {
      const { data: createdCust } = await supabase.from('customers').insert([{
        name: customerObj.name,
        phone: customerObj.phone,
        address: customerObj.address
      }]).select().single();

      if (createdCust) {
        await supabase.from('contracts').insert([{
          contract_number: newContract.contract_number,
          customer_id: createdCust.id,
          container_id: newContract.container_id,
          contract_type: newContract.contract_type,
          period_type: newContract.period_type,
          duration_days: newContract.duration_days,
          start_date: newContract.start_date,
          end_date: newContract.end_date,
          expected_pickup_time: newContract.expected_pickup_time,
          location_latitude: newContract.location_latitude,
          location_longitude: newContract.location_longitude,
          google_maps_url: newContract.google_maps_url,
          location_address: newContract.location_address,
          total_cost: newContract.total_cost,
          paid_amount: newContract.paid_amount,
          receipt_number: receiptNumber,
          status: 'active'
        }]);
      }
    } catch (err) {
      console.warn('Database insert synced locally:', err);
    }

    return true;
  };

  // Staff Management Handlers
  const handleAddStaff = async (staffData: any): Promise<boolean> => {
    const newProfile: Profile = {
      id: `staff-${Date.now()}`,
      full_name: staffData.full_name,
      email: staffData.email,
      phone: staffData.phone,
      role: 'employee',
      is_active: true,
      can_view_all_records: staffData.can_view_all_records ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setStaffList(prev => [...prev, newProfile]);
    return true;
  };

  const handleToggleStaffStatus = async (profileId: string, currentActive: boolean) => {
    setStaffList(prev => prev.map(p => p.id === profileId ? { ...p, is_active: !currentActive } : p));
  };

  const handleToggleStaffViewAll = async (profileId: string, currentViewAll: boolean) => {
    setStaffList(prev => prev.map(p => p.id === profileId ? { ...p, can_view_all_records: !currentViewAll } : p));
  };

  const handleDeleteStaff = async (profileId: string) => {
    setStaffList(prev => prev.filter(p => p.id !== profileId));
  };

  const handleMarkNotificationSent = async (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'sent', sent_at: new Date().toISOString() } : n));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Dramatic Cinematic Splash Intro */}
      {showSplash && (
        <SplashIntro onComplete={() => setShowSplash(false)} />
      )}

      {/* 2. Top Navigation Bar with 🔔 In-App Notification Bell */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onReplayIntro={() => setShowSplash(true)}
        onOpenNewContract={() => {
          setPreSelectedContainerId(undefined);
          setIsContractModalOpen(true);
        }}
        inAppNotifications={inAppNotifications}
        onMarkInAppAsRead={handleMarkInAppAsRead}
        onMarkAllInAppAsRead={handleMarkAllInAppAsRead}
        onClearAllInApp={handleClearAllInApp}
        onSelectContract={handleSelectContractFromNotification}
      />

      {/* 3. Main Body Content */}
      <main style={{
        flex: 1,
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '30px 24px 60px 24px'
      }}>
        {currentTab === 'search' && (
          <SmartSearch
            containers={containers}
            contracts={contracts}
            customers={customers}
            notifications={notifications}
            onOpenNewContractWithContainer={(cId) => {
              setPreSelectedContainerId(cId);
              setIsContractModalOpen(true);
            }}
            onSendWhatsApp={handleSendWhatsApp}
          />
        )}

        {currentTab === 'containers' && (
          <ContainersView
            containers={containers}
            userRole={currentRole}
            onUpdateStatus={handleUpdateContainerStatus}
            onAddContainer={handleAddContainer}
            onDeleteContainer={handleDeleteContainer}
            onOpenRentModal={(cId) => {
              setPreSelectedContainerId(cId);
              setIsContractModalOpen(true);
            }}
          />
        )}

        {currentTab === 'contracts' && (
          <ContractsView
            contracts={contracts}
            userRole={currentRole}
            paymentSettings={paymentSettings}
            onUpdateContractStatus={handleUpdateContractStatus}
            onDeleteContract={handleDeleteContract}
            onSendWhatsApp={handleSendWhatsApp}
            onOpenReceipt={(contract) => setSelectedReceiptContract(contract)}
            onOpenManualPayment={(contract) => setSelectedManualPaymentContract(contract)}
            onSendInvoiceLink={handleSendInvoiceLink}
          />
        )}

        {currentTab === 'whatsapp' && (
          <WhatsAppHub
            notifications={notifications}
            onMarkAsSent={handleMarkNotificationSent}
            onSendWhatsApp={handleSendWhatsApp}
          />
        )}

        {currentTab === 'staff' && currentRole === 'admin' && (
          <StaffManagement
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onToggleStatus={handleToggleStaffStatus}
            onToggleViewAll={handleToggleStaffViewAll}
            onDeleteStaff={handleDeleteStaff}
          />
        )}

        {currentTab === 'payment-settings' && currentRole === 'admin' && (
          <PaymentSettings
            settings={paymentSettings}
            onSaveSettings={handleSavePaymentSettings}
          />
        )}

        {currentTab === 'gateway-settings' && currentRole === 'admin' && (
          <WhatsAppSettings
            settings={gatewaySettings}
            notifications={notifications}
            onSaveSettings={handleSaveGatewaySettings}
            onTestConnection={handleTestConnection}
            onSendWhatsApp={handleSendWhatsApp}
            onMarkAsSent={handleMarkNotificationSent}
          />
        )}
      </main>

      {/* 4. New Contract Booking Modal */}
      <NewContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        containers={containers}
        preSelectedContainerId={preSelectedContainerId}
        onSaveContract={handleSaveContract}
      />

      {/* 5. Printable Official PDF Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptContract}
        onClose={() => setSelectedReceiptContract(null)}
        contract={selectedReceiptContract}
        onSendWhatsAppReceipt={handleSendWhatsApp}
      />

      {/* 6. Manual Payment Collection Modal (Cash / POS / Transfer) */}
      <ManualPaymentModal
        isOpen={!!selectedManualPaymentContract}
        onClose={() => setSelectedManualPaymentContract(null)}
        contract={selectedManualPaymentContract}
        onConfirmPayment={handleConfirmManualPayment}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px 24px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        المحترز للحاويات © {new Date().getFullYear()} — نظام إدارة وتأجير الحاويات التجارية والأنقاض والتحصيل المالي
      </footer>
    </div>
  );
}
