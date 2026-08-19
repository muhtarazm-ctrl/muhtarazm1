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
