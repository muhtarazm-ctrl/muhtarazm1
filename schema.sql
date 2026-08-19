-- ==============================================================================
-- مشروع: نظام إدارة وتأجير الحاويات - "المخترز للحاويات"
-- ملف قاعدة البيانات وسياسات الأمان (Supabase Schema with RLS)
-- ==============================================================================

-- تفعيل إضافات PostgreSQL الأساسية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. دالة تحديث حقل updated_at تلقائياً
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. جدول profiles (الملفات الشخصية للموظفين والمدراء وتحديد الصلاحيات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee', 'driver')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تعليق على جدول profiles
COMMENT ON TABLE public.profiles IS 'جدول الملفات الشخصية للموظفين والإدارة وتحديد الصلاحيات';

-- تفعيل الزناد لتحديث updated_at
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. دالة إضافة الموظف تلقائياً عند التسجيل في Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- زناد ربط المستخدم الجديد بالملف الشخصي
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. جدول containers (الحاويات وأرقامها ومقاساتها وحالتها)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_number TEXT UNIQUE NOT NULL,                       -- رقم الحاوية الفريد (مثال: CONT-101)
    size TEXT NOT NULL,                                          -- الحجم (مثال: 12 ياردة، 20 ياردة، 30 ياردة، 40 قدم)
    type TEXT NOT NULL DEFAULT 'debris' CHECK (type IN ('debris', 'commercial', 'storage', 'industrial')), -- نوع الحاوية: أنقاض، تجاري، تخزين، صناعي
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'reserved', 'retired')), -- الحالة: متاحة، مؤجرة، صيانة، محجوزة، خارج الخدمة
    daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- سعر الإيجار اليومي
    monthly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,           -- سعر الإيجار الشهري
    notes TEXT,                                                  -- ملاحظات إضافية
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تعليق على جدول containers
COMMENT ON TABLE public.containers IS 'جدول الحاويات وأرقامها وأحجامها وحالتها التشغيلية';

-- تفعيل الزناد لتحديث updated_at
DROP TRIGGER IF EXISTS tr_containers_updated_at ON public.containers;
CREATE TRIGGER tr_containers_updated_at
    BEFORE UPDATE ON public.containers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. جدول customers (بيانات العملاء وأرقام هواتفهم)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                                          -- اسم العميل أو اسم المؤسسة/الشركة
    phone TEXT NOT NULL,                                         -- رقم الهاتف الأساسي (تواصل / واتساب)
    alt_phone TEXT,                                              -- رقم هاتف إضافي
    email TEXT,                                                  -- البريد الإلكتروني
    customer_type TEXT NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company', 'contractor', 'government')), -- نوع العميل: فرد، شركة، مقاول، حكومي
    commercial_register TEXT,                                    -- السجل التجاري (للشركات والمؤسسات)
    tax_number TEXT,                                             -- الرقم الضريبي
    address TEXT,                                                -- العنوان أو الحي
    city TEXT NOT NULL DEFAULT 'الرياض',                         -- المدينة
    notes TEXT,                                                  -- ملاحظات عامة حول العميل
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تعليق على جدول customers
COMMENT ON TABLE public.customers IS 'جدول بيانات العملاء وأرقام الاتصال والسجلات';

-- إنشاء فهارس للبحث السريع عن العملاء
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- تفعيل الزناد لتحديث updated_at
DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. جدول contracts (العقود: نوع العقد، المدة، الموقع، التكلفة، الموظف المسؤول)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT UNIQUE NOT NULL,                        -- رقم العقد (مثال: CTR-2026-0001)
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    container_id UUID REFERENCES public.containers(id) ON DELETE SET NULL,
    
    -- نوع العقد
    contract_category TEXT NOT NULL CHECK (contract_category IN ('commercial', 'debris')), -- تجاري أو أنقاض
    contract_type TEXT NOT NULL CHECK (contract_type IN ('daily', 'monthly', 'semi_annual', 'annual', 'custom')), -- يومي، شهري، نصف سنوي، سنوي، مخصص
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'overdue')), -- حالة العقد
    
    -- تواريخ العقد
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,               -- تاريخ البداية
    end_date DATE NOT NULL,                                      -- تاريخ النهاية
    
    -- الموقع والإحداثيات
    location_latitude DOUBLE PRECISION,                          -- خط العرض
    location_longitude DOUBLE PRECISION,                         -- خط الطول
    google_maps_url TEXT,                                        -- رابط خرائط جوجل
    delivery_address TEXT,                                       -- وصف العنوان المكتوب
    
    -- التكاليف والمدفوعات
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- تكلفة العقد الإجمالية
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,            -- المبلغ المدفوع
    remaining_amount NUMERIC(10, 2) GENERATED ALWAYS AS (total_cost - paid_amount) STORED, -- المبلغ المتبقي المحسوب تلقائياً
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mada', 'cheque', 'other')),
    
    -- الموظف المسؤول
    assigned_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- الموظف أو السائق المسؤول
    
    notes TEXT,                                                  -- شروط أو ملاحظات العقد
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تعليق على جدول contracts
COMMENT ON TABLE public.contracts IS 'جدول العقود والتأجير وتفاصيل المواقع والتكاليف';

-- فهارس جدول contracts
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON public.contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_container_id ON public.contracts(container_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON public.contracts(end_date);

-- تفعيل الزناد لتحديث updated_at
DROP TRIGGER IF EXISTS tr_contracts_updated_at ON public.contracts;
CREATE TRIGGER tr_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- دالة لتحديث حالة الحاوية تلقائياً عند تغيير حالة العقد
CREATE OR REPLACE FUNCTION public.sync_container_status_on_contract()
RETURNS TRIGGER AS $$
BEGIN
    -- إذا كان العقد نشطاً وتم تحديد حاوية، تحويل حالة الحاوية إلى "مؤجرة"
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.status = 'active' AND NEW.container_id IS NOT NULL THEN
            UPDATE public.containers 
            SET status = 'rented' 
            WHERE id = NEW.container_id;
        ELSIF NEW.status IN ('completed', 'cancelled') AND NEW.container_id IS NOT NULL THEN
            UPDATE public.containers 
            SET status = 'available' 
            WHERE id = NEW.container_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_container_status ON public.contracts;
CREATE TRIGGER tr_sync_container_status
    AFTER INSERT OR UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_container_status_on_contract();

-- ==============================================================================
-- 7. جدول notification_logs (سجل تنبيهات الواتساب والرسائل)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,                                  -- الرقم المستلم
    channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email')),
    message_type TEXT NOT NULL CHECK (message_type IN (
        'contract_created',      -- إشعار توثيق العقد
        'payment_reminder',      -- تذكير بدفع مستحقات
        'delivery_notice',       -- إشعار وصول وتنزيل الحاوية
        'pickup_reminder',       -- تذكير بانتهاء العقد وموعد سحب الحاوية
        'renewal_notice',        -- عرض تجديد العقد
        'custom_alert'           -- رسالة مخصصة
    )),
    message_body TEXT NOT NULL,                                  -- نص الرسالة المرسلة
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')), -- حالة الإرسال
    error_message TEXT,                                          -- تفاصيل الخطأ في حال الفشل
    sent_at TIMESTAMPTZ,                                         -- وقت الإرسال الفعلي
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تعليق على جدول notification_logs
COMMENT ON TABLE public.notification_logs IS 'سجل إرسال رسائل وتنبيهات الواتساب والرسائل النصية';

CREATE INDEX IF NOT EXISTS idx_notifications_contract ON public.notification_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_phone ON public.notification_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notification_logs(status);

-- ==============================================================================
-- 8. سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)
-- ==============================================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- دالة مساعدة لمعرفة هل المستخدم الحالي مدير (Admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة مساعدة لمعرفة هل المستخدم الحالي موظف نشط في النظام
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee', 'driver') AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- سياسات جدول profiles
-- ------------------------------------------------------------------------------
-- 1. الموظف يستطيع قراءة وتعديل ملفه الشخصي
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. جميع الموظفين النشطين يمكنهم رؤية قائمة زملاء العمل
CREATE POLICY "Staff can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_staff());

-- 3. المدراء (Admins) لديهم كامل الصلاحيات لإضافة وتعديل وحذف الملفات وتغيير الصلاحيات
CREATE POLICY "Admins have full access on profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول containers
-- ------------------------------------------------------------------------------
-- الموظفون يمكنهم القراءة والإضافة والتعديل
CREATE POLICY "Staff can view containers"
    ON public.containers FOR SELECT
    USING (public.is_staff());

CREATE POLICY "Staff can insert containers"
    ON public.containers FOR INSERT
    WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update containers"
    ON public.containers FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Admins can delete containers"
    ON public.containers FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول customers
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view customers"
    ON public.customers FOR SELECT
    USING (public.is_staff());

CREATE POLICY "Staff can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update customers"
    ON public.customers FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Admins can delete customers"
    ON public.customers FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول contracts
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view contracts"
    ON public.contracts FOR SELECT
    USING (public.is_staff());

CREATE POLICY "Staff can insert contracts"
    ON public.contracts FOR INSERT
    WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update contracts"
    ON public.contracts FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Admins can delete contracts"
    ON public.contracts FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول notification_logs
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view notifications"
    ON public.notification_logs FOR SELECT
    USING (public.is_staff());

CREATE POLICY "Staff can insert notifications"
    ON public.notification_logs FOR INSERT
    WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update notifications"
    ON public.notification_logs FOR UPDATE
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Admins can delete notifications"
    ON public.notification_logs FOR DELETE
    USING (public.is_admin());

-- ==============================================================================
-- 9. بيانات تجريبية أولية (Initial Seed Data) - للتجربة السريعة
-- ==============================================================================
INSERT INTO public.containers (container_number, size, type, status, daily_rate, monthly_rate, notes)
VALUES 
    ('CONT-101', '20 ياردة', 'debris', 'available', 150.00, 2500.00, 'حاوية مخلفات بناء بحالة ممتازة'),
    ('CONT-102', '30 ياردة', 'debris', 'available', 220.00, 3500.00, 'حاوية كبيرة للمشاريع والمقاولات'),
    ('CONT-103', '12 ياردة', 'debris', 'available', 100.00, 1800.00, 'حاوية صغيرة للترميم والمنازل'),
    ('CONT-201', '40 قدم', 'commercial', 'available', 300.00, 4800.00, 'حاوية تجارية مغلقة للمستودعات')
ON CONFLICT (container_number) DO NOTHING;
