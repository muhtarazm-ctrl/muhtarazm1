export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  return handleProcess();
}

export async function POST() {
  return handleProcess();
}

async function handleProcess() {
  try {
    // 1. Fetch Gateway Settings
    let adminPhone = '+966500000001';
    let autoSendEnabled = true;

    try {
      const { data: settings } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1)
        .single();

      if (settings) {
        adminPhone = settings.admin_phone || adminPhone;
        autoSendEnabled = settings.auto_send_enabled ?? true;
      }
    } catch (err) {
      console.warn('Could not fetch settings for cron, using defaults');
    }

    // 2. Query contracts expiring in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('*, customer:customers(*), container:containers(*)')
      .eq('status', 'active')
      .lte('end_date', tomorrow.toISOString())
      .gte('end_date', now.toISOString());

    if (error) {
      throw error;
    }

    const processed = [];

    if (contracts && contracts.length > 0) {
      for (const contract of contracts) {
        const customer = contract.customer;
        const daysLeft = Math.max(0, Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        
        // Build Reminder Message
        const customerMsg = `مرحباً ${customer?.name || 'عزيزنا العميل'} 👋\nنود تذكيركم بأن عقد الحاوية رقم (${contract.contract_number}) سينتهي خلال ${daysLeft} يوم.\nيرجى التواصل معنا لتجديد العقد أو جدولة سحب الحاوية.\n\nالمحترز للحاويات 🏗️`;

        // Send via internal WhatsApp route or log
        try {
          await supabase.from('notification_logs').insert([{
            contract_id: contract.id,
            customer_id: customer?.id,
            phone: customer?.phone || '',
            message: customerMsg,
            recipient_role: 'customer',
            notification_type: 'cron_expiry_notice',
            status: 'pending'
          }]);
          processed.push(contract.contract_number);
        } catch (e) {
          console.error('Error queueing notification:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed_count: processed.length,
      contracts: processed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
