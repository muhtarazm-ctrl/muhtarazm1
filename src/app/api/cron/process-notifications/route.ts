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
        if (settings.admin_phone) adminPhone = settings.admin_phone;
        autoSendEnabled = settings.auto_send_enabled;
      }
    } catch (e) {
      console.warn('Using fallback settings for cron:', e);
    }

    if (!autoSendEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Auto-send is currently disabled in WhatsApp settings',
        processed: 0
      });
    }

    // 2. Fetch pending notifications due now
    let pendingList: any[] = [];
    try {
      const { data } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString());

      if (data) pendingList = data;
    } catch (e) {
      console.warn('Error fetching pending notifications:', e);
    }

    let sentCount = 0;

    // 3. Process each notification
    for (const item of pendingList) {
      // Mark as sent
      try {
        await supabase
          .from('notification_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', item.id);
        sentCount++;
      } catch (err) {
        console.error('Error updating notification status:', err);
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingList.length,
      sentCount,
      adminPhoneNotified: adminPhone,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
