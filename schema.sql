-- ==============================================================================
-- مشروع: نظام إدارة وتأجير الحاويات - "المخترز للحاويات"
-- ملف قاعدة البيانات وسياسات الأمان المعدل (Supabase Schema with RLS)
-- التحديث: نوعان فقط للحاويات (تجاري / أنقاض) + نظام الصلاحيات المطور + محرك جدولة إشعارات الواتساب
-- ==============================================================================

-- تفعيل إضافات PostgreSQL الأساسية
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. دالة تحديث حقل updated_at تلقائياً عند أي تعديل
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. جدول profiles (المستخدمون: المدير والموظفون وتوزيع الصلاحيات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,                                     -- اسم الموظف / المدير
    email TEXT UNIQUE NOT NULL,                                  -- البريد الإلكتروني
    phone TEXT,                                                  -- رقم الجوال
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')), -- الصلاحية: مدير أو موظف
    is_active BOOLEAN NOT NULL DEFAULT true,                     -- حالة الحساب (نشط / موقوف)
    can_view_all_records BOOLEAN NOT NULL DEFAULT true,          -- هل يرى كافة العقود أم العقود التي أدخلها فقط
    notes TEXT,                                                  -- ملاحظات إضافية
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'جدول الموظفين والإدارة وتحديد الصلاحيات وحالة الحسابات';

-- زناد تحديث updated_at لجدول profiles
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. دالة إضافة المستخدم في profiles تلقائياً عند إنشائه في Supabase Auth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. جدول containers (الحاويات: نوعان فقط - تجاري أو أنقاض بدون مقاسات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_number TEXT UNIQUE NOT NULL,                       -- رقم الحاوية الفريد (مثال: C-101 أو D-201)
    type TEXT NOT NULL CHECK (type IN ('commercial', 'debris')), -- نوع الحاوية: تجاري أو أنقاض فقط
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')), -- الحالة: متاحة، مؤجرة، في الصيانة
    daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- سعر الإيجار اليومي
    monthly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,           -- سعر الإيجار الشهري
    notes TEXT,                                                  -- ملاحظات حول الحاوية
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.containers IS 'جدول الحاويات (تجاري / أنقاض) وحالتها التشغيلية وأسعارها';

DROP TRIGGER IF EXISTS tr_containers_updated_at ON public.containers;
CREATE TRIGGER tr_containers_updated_at
    BEFORE UPDATE ON public.containers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. جدول customers (بيانات العملاء)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                                          -- اسم العميل أو المؤسسة
    phone TEXT NOT NULL,                                         -- رقم الجوال مع كود الدولة للواتساب (مثال: +966500000000)
    alt_phone TEXT,                                              -- رقم بديل
    customer_type TEXT NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')), -- فرد أو شركة
    address TEXT,                                                -- العنوان التقريبي
    notes TEXT,                                                  -- ملاحظات العميل
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.customers IS 'جدول بيانات العملاء وأرقام الاتصال والتواصل';

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. جدول contracts (العقود: نوع العقد، المدة، الموقع الجغرافي، التكلفة والموظف)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT UNIQUE NOT NULL,                        -- رقم العقد المميز (مثال: CTR-2026-001)
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    container_id UUID REFERENCES public.containers(id) ON DELETE SET NULL,
    
    -- نوع وفترة العقد
    contract_type TEXT NOT NULL CHECK (contract_type IN ('commercial', 'debris')), -- تجاري أو أنقاض
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'monthly', 'semi_annual', 'annual')), -- يومي، شهري، نصف سنوي، سنوي
    duration_days INTEGER DEFAULT 1,                             -- عدد الأيام في العقود اليومية
    
    -- التواريخ والمواعيد
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),               -- تاريخ ووقت بداية العقد والتنزيل
    end_date TIMESTAMPTZ NOT NULL,                              -- تاريخ ووقت نهاية العقد
    expected_pickup_time TIMESTAMPTZ,                            -- تاريخ ووقت السحب المتوقع (خاص بعقود الأنقاض)
    
    -- الموقع الجغرافي
    location_latitude DOUBLE PRECISION,                          -- خط العرض عبر GPS
    location_longitude DOUBLE PRECISION,                         -- خط الطول عبر GPS
    google_maps_url TEXT,                                        -- رابط خرائط جوجل المباشر
    location_address TEXT,                                       -- وصف الموقع أو الحي
    
    -- التكلفة والماليات
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- تكلفة العقد الإجمالية
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,            -- المبلغ المدفوع
    remaining_amount NUMERIC(10, 2) GENERATED ALWAYS AS (total_cost - paid_amount) STORED, -- المتبقي المحسوب تلقائياً
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    
    -- حالة العقد
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'extended')),
    
    -- الموظفون المرتبطون
    created_by_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- الموظف مدخل العقد
    assigned_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,   -- الموظف المسؤول عن المتابعة
    
    notes TEXT,                                                  -- ملاحظات وشروط العقد
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.contracts IS 'جدول العقود وتفاصيل الحجز والتواريخ والمواقع والتكاليف';

CREATE INDEX IF NOT EXISTS idx_contracts_customer ON public.contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_container ON public.contracts(container_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_pickup ON public.contracts(expected_pickup_time);

DROP TRIGGER IF EXISTS tr_contracts_updated_at ON public.contracts;
CREATE TRIGGER tr_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. دالة وزناد مزامنة حالة الحاوية تلقائياً عند إنشاء/تحديث العقد
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.sync_container_status_on_contract()
RETURNS TRIGGER AS $$
BEGIN
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
-- 8. جدول notification_logs (محرك وسجل تنبيهات الواتساب المجدولة والمرسلة)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    recipient_role TEXT NOT NULL CHECK (recipient_role IN ('customer', 'employee', 'admin')), -- الطرف المستلم: عميل / موظف / مدير
    recipient_phone TEXT NOT NULL,                               -- رقم جوال المستلم بصيغة الواتساب
    recipient_name TEXT,                                         -- اسم المستلم
    
    -- نوع الإشعار التلقائي
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'debris_pickup_4h',      -- إشعار قبل 4-6 ساعات لانتهاء عقد الأنقاض (للسحب أو التمديد)
        'commercial_7d_before',  -- إشعار تجاري أول قبل 7 أيام من انتهاء العقد
        'commercial_2d_before',  -- إشعار تجاري ثانٍ قبل يومين لتأكيد التجديد وتجهيز الفاتورة
        'contract_created',      -- إشعار توثيق العقد للعميل والموظف فور إنشائه
        'custom_alert'           -- تنبيه مخصص يدوي
    )),
    
    message_body TEXT NOT NULL,                                  -- نص الرسالة المرسلة
    scheduled_for TIMESTAMPTZ NOT NULL,                          -- موعد الإرسال المجدول
    sent_at TIMESTAMPTZ,                                         -- وقت الإرسال الفعلي
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')), -- حالة الإرسال
    error_message TEXT,                                          -- رسالة الخطأ إن وجدت
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notification_logs IS 'سجل ومحرك جدولة إشعارات الواتساب للعقود اليومية والتجارية';

CREATE INDEX IF NOT EXISTS idx_notifications_contract ON public.notification_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notification_logs(scheduled_for, status);

-- ==============================================================================
-- 9. دالة لتوليد رسائل وتنبيهات الواتساب تلقائياً عند إنشاء العقد
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.schedule_contract_whatsapp_notifications()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_name TEXT;
    v_customer_phone TEXT;
    v_container_num TEXT;
    v_emp_phone TEXT;
    v_emp_name TEXT;
    v_admin_phone TEXT;
BEGIN
    -- جلب بيانات العميل
    SELECT name, phone INTO v_customer_name, v_customer_phone 
    FROM public.customers WHERE id = NEW.customer_id;
    
    -- جلب رقم الحاوية
    SELECT container_number INTO v_container_num 
    FROM public.containers WHERE id = NEW.container_id;

    -- جلب بيانات الموظف
    IF NEW.assigned_employee_id IS NOT NULL THEN
        SELECT full_name, phone INTO v_emp_name, v_emp_phone 
        FROM public.profiles WHERE id = NEW.assigned_employee_id;
    END IF;

    -- 1. إشعار توثيق العقد المباشر للعميل
    IF v_customer_phone IS NOT NULL THEN
        INSERT INTO public.notification_logs (
            contract_id, customer_id, recipient_role, recipient_phone, recipient_name,
            notification_type, message_body, scheduled_for, status
        ) VALUES (
            NEW.id, NEW.customer_id, 'customer', v_customer_phone, v_customer_name,
            'contract_created',
            'مرحباً ' || COALESCE(v_customer_name, 'عزيزنا العميل') || '، تم توثيق عقدك رقم (' || NEW.contract_number || ') بنجاح لدى المخترز للحاويات. رقم الحاوية: ' || COALESCE(v_container_num, '-') || '. شكراً لثقتكم بنا.',
            NOW(), 'pending'
        );
    END IF;

    -- 2. في حالة عقود الأنقاض (اليومية): جدولة تنبيه قبل موعد السحب بـ 4 ساعات
    IF NEW.contract_type = 'debris' THEN
        DECLARE
            v_pickup_time TIMESTAMPTZ := COALESCE(NEW.expected_pickup_time, NEW.end_date);
            v_remind_time TIMESTAMPTZ := v_pickup_time - INTERVAL '4 hours';
        BEGIN
            -- تذكير العميل
            IF v_customer_phone IS NOT NULL AND v_remind_time > NOW() THEN
                INSERT INTO public.notification_logs (
                    contract_id, customer_id, recipient_role, recipient_phone, recipient_name,
                    notification_type, message_body, scheduled_for, status
                ) VALUES (
                    NEW.id, NEW.customer_id, 'customer', v_customer_phone, v_customer_name,
                    'debris_pickup_4h',
                    'عزيزنا ' || COALESCE(v_customer_name, 'العميل') || '، نود تذكيركم بقرب موعد سحب حاوية الأنقاض رقم (' || COALESCE(v_container_num, '-') || ') خلال 4 ساعات. في حال رغبتكم بالتمديد يرجى التواصل معنا.',
                    v_remind_time, 'pending'
                );
            END IF;

            -- تنبيه الموظف التشغيلي
            IF v_emp_phone IS NOT NULL AND v_remind_time > NOW() THEN
                INSERT INTO public.notification_logs (
                    contract_id, customer_id, recipient_role, recipient_phone, recipient_name,
                    notification_type, message_body, scheduled_for, status
                ) VALUES (
                    NEW.id, NEW.customer_id, 'employee', v_emp_phone, v_emp_name,
                    'debris_pickup_4h',
                    'تنبيه تشغيلي: يرجى تجهيز السائق لسحب حاوية الأنقاض (' || COALESCE(v_container_num, '-') || ') للعميل ' || COALESCE(v_customer_name, '-') || ' خلال 4 ساعات.',
                    v_remind_time, 'pending'
                );
            END IF;
        END;

    -- 3. في حالة العقود التجارية (شهري / نصف سنوي / سنوي)
    ELSIF NEW.contract_type = 'commercial' THEN
        DECLARE
            v_7d_time TIMESTAMPTZ := NEW.end_date - INTERVAL '7 days';
            v_2d_time TIMESTAMPTZ := NEW.end_date - INTERVAL '2 days';
        BEGIN
            -- إشعار قبل 7 أيام للعميل
            IF v_customer_phone IS NOT NULL AND v_7d_time > NOW() THEN
                INSERT INTO public.notification_logs (
                    contract_id, customer_id, recipient_role, recipient_phone, recipient_name,
                    notification_type, message_body, scheduled_for, status
                ) VALUES (
                    NEW.id, NEW.customer_id, 'customer', v_customer_phone, v_customer_name,
                    'commercial_7d_before',
                    'عزيزنا ' || COALESCE(v_customer_name, 'العميل') || '، نود إحاطتكم بأن عقد الحاوية التجارية رقم (' || NEW.contract_number || ') سينتهي بعد 7 أيام. للتجديد يرجى التواصل معنا لتجهيز الفاتورة.',
                    v_7d_time, 'pending'
                );
            END IF;

            -- إشعار قبل يومين للعميل والموظف لتأكيد التجديد
            IF v_customer_phone IS NOT NULL AND v_2d_time > NOW() THEN
                INSERT INTO public.notification_logs (
                    contract_id, customer_id, recipient_role, recipient_phone, recipient_name,
                    notification_type, message_body, scheduled_for, status
                ) VALUES (
                    NEW.id, NEW.customer_id, 'customer', v_customer_phone, v_customer_name,
                    'commercial_2d_before',
                    'تذكير نهائي: يتبقى يومان على انتهاء عقد الحاوية التجاري (' || NEW.contract_number || '). نرجو تأكيد رغبتكم في التجديد وإصدار الفاتورة.',
                    v_2d_time, 'pending'
                );
            END IF;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_schedule_contract_whatsapp ON public.contracts;
CREATE TRIGGER tr_schedule_contract_whatsapp
    AFTER INSERT ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.schedule_contract_whatsapp_notifications();

-- ==============================================================================
-- 10. سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)
-- ==============================================================================

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

-- دالة مساعدة لمعرفة هل المستخدم الحالي موظف نشط
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- سياسات جدول profiles (المستخدمون والموظفون)
-- ------------------------------------------------------------------------------
-- 1. المدير له الصلاحية المطلقة لإضافة، تعديل، حذف، وتغيير صلاحيات الموظفين
CREATE POLICY "Admins full control on profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. الموظف يستطيع قراءة ملفه الشخصي وقائمة الموظفين
CREATE POLICY "Staff can view profiles"
    ON public.profiles FOR SELECT
    USING (public.is_active_staff());

-- 3. الموظف يستطيع تحديث بياناته الشخصية الأساسية فقط
CREATE POLICY "Staff can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id AND public.is_active_staff())
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- سياسات جدول containers (الحاويات)
-- ------------------------------------------------------------------------------
-- الموظفون النشطون يمكنهم القراءة والإضافة وتحديث الحالة (متاحة، مؤجرة، صيانة)
CREATE POLICY "Staff can view containers"
    ON public.containers FOR SELECT
    USING (public.is_active_staff());

CREATE POLICY "Staff can insert containers"
    ON public.containers FOR INSERT
    WITH CHECK (public.is_active_staff());

CREATE POLICY "Staff can update containers"
    ON public.containers FOR UPDATE
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- الحذف متاح حصرياً للمدير فقط
CREATE POLICY "Admins only can delete containers"
    ON public.containers FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول customers (العملاء)
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view customers"
    ON public.customers FOR SELECT
    USING (public.is_active_staff());

CREATE POLICY "Staff can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (public.is_active_staff());

CREATE POLICY "Staff can update customers"
    ON public.customers FOR UPDATE
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- الحذف متاح للمدير فقط
CREATE POLICY "Admins only can delete customers"
    ON public.customers FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول contracts (العقود)
-- ------------------------------------------------------------------------------
-- الموظف يرى السجلات (الكل أو المسندة إليه)، ويدخل ويعدل
CREATE POLICY "Staff can view contracts"
    ON public.contracts FOR SELECT
    USING (
        public.is_admin() OR (
            public.is_active_staff() AND (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_view_all_records = true)
                OR created_by_employee_id = auth.uid() 
                OR assigned_employee_id = auth.uid()
            )
        )
    );

CREATE POLICY "Staff can insert contracts"
    ON public.contracts FOR INSERT
    WITH CHECK (public.is_active_staff());

CREATE POLICY "Staff can update contracts"
    ON public.contracts FOR UPDATE
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- الحذف محصور للمدير فقط
CREATE POLICY "Admins only can delete contracts"
    ON public.contracts FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- سياسات جدول notification_logs (سجل التنبيهات)
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view notifications"
    ON public.notification_logs FOR SELECT
    USING (public.is_active_staff());

CREATE POLICY "Staff can insert and update notifications"
    ON public.notification_logs FOR INSERT
    WITH CHECK (public.is_active_staff());

CREATE POLICY "Staff can update notifications status"
    ON public.notification_logs FOR UPDATE
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

CREATE POLICY "Admins only can delete notifications"
    ON public.notification_logs FOR DELETE
    USING (public.is_admin());

-- ==============================================================================
-- 11. بيانات تجريبية أولية (Seed Data)
-- ==============================================================================
-- إضافة حاويات تجريبية من النوعين فقط (تجاري وأنقاض)
INSERT INTO public.containers (container_number, type, status, daily_rate, monthly_rate, notes)
VALUES 
    ('C-101', 'commercial', 'available', 0.00, 3500.00, 'حاوية تجارية مغلقة للمستودعات والشركات'),
    ('C-102', 'commercial', 'available', 0.00, 3500.00, 'حاوية تجارية مخصصة للمنشآت والمجمعات'),
    ('D-201', 'debris', 'available', 150.00, 0.00, 'حاوية أنقاض ومخلفات بناء وترميم'),
    ('D-202', 'debris', 'available', 150.00, 0.00, 'حاوية أنقاض للمشاريع والمقاولات'),
    ('D-203', 'debris', 'available', 150.00, 0.00, 'حاوية أنقاض ومخلفات يومية')
ON CONFLICT (container_number) DO NOTHING;
