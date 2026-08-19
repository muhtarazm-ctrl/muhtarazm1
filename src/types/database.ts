export type UserRole = 'admin' | 'employee';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  can_view_all_records: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ContainerType = 'commercial' | 'debris';
export type ContainerStatus = 'available' | 'rented' | 'maintenance';

export interface Container {
  id: string;
  container_number: string;
  type: ContainerType;
  status: ContainerStatus;
  daily_rate: number;
  monthly_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  alt_phone?: string;
  customer_type: 'individual' | 'company';
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ContractPeriodType = 'daily' | 'monthly' | 'semi_annual' | 'annual';
export type ContractStatus = 'active' | 'completed' | 'cancelled' | 'extended';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface Contract {
  id: string;
  contract_number: string;
  customer_id: string;
  container_id?: string;
  contract_type: ContainerType; // commercial or debris
  period_type: ContractPeriodType;
  duration_days: number;
  start_date: string;
  end_date: string;
  expected_pickup_time?: string;
  location_latitude?: number;
  location_longitude?: number;
  google_maps_url?: string;
  location_address?: string;
  total_cost: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: PaymentStatus;
  status: ContractStatus;
  created_by_employee_id?: string;
  assigned_employee_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined fields for UI convenience
  customer?: Customer;
  container?: Container;
  assigned_employee?: Profile;
}

export type RecipientRole = 'customer' | 'employee' | 'admin';
export type NotificationType =
  | 'debris_pickup_4h'
  | 'commercial_7d_before'
  | 'commercial_2d_before'
  | 'contract_created'
  | 'custom_alert';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface NotificationLog {
  id: string;
  contract_id?: string;
  customer_id?: string;
  recipient_role: RecipientRole;
  recipient_phone: string;
  recipient_name?: string;
  notification_type: NotificationType;
  message_body: string;
  scheduled_for: string;
  sent_at?: string;
  status: NotificationStatus;
  error_message?: string;
  created_at: string;
  
  // Joined field
  contract?: Contract;
}

// In-App Internal Notification Types
export type InAppNotificationType =
  | 'contract_expiry_soon'
  | 'contract_created'
  | 'container_status_change'
  | 'payment_alert'
  | 'system_alert';

export interface InAppNotification {
  id: string;
  user_id?: string;
  contract_id?: string;
  title: string;
  message: string;
  type: InAppNotificationType;
  is_read: boolean;
  created_at: string;
}

// 100% Free WhatsApp Gateway Modes
export type WhatsAppMode = 'evolution' | 'wame';

export interface WhatsAppSettings {
  id?: string;
  mode: WhatsAppMode; // 'evolution' (Evolution API free local docker) or 'wame' (Direct wa.me free)
  
  // Evolution API Settings
  evolution_server_url: string; // http://localhost:8080
  evolution_instance_name: string; // muhtaraz-instance
  evolution_api_key: string; // 123456
  
  // Common Settings
  sender_phone: string; // +966920001234
  admin_phone: string; // +966500000001
  
  is_connected: boolean;
  auto_send_enabled: boolean;
  updated_at?: string;
}
