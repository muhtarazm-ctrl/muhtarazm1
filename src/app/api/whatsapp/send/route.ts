export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, contract_id, customer_id, recipient_role, notification_type } = body;

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: 'Phone and message are required' }, { status: 400 });
    }

    // 1. Fetch WhatsApp Gateway Settings
    let mode = 'evolution';
    let evolutionServerUrl = 'http://localhost:8080';
    let evolutionInstance = 'muhtaraz-instance';
    let evolutionApiKey = '123456';
    let autoSendEnabled = true;

    try {
      const { data: settings } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1)
        .single();

      if (settings) {
        mode = settings.gateway_mode || 'evolution';
        evolutionServerUrl = settings.evolution_server_url || evolutionServerUrl;
        evolutionInstance = settings.evolution_instance || evolutionInstance;
        evolutionApiKey = settings.evolution_api_key || evolutionApiKey;
        autoSendEnabled = settings.auto_send_enabled ?? true;
      }
    } catch (err) {
      console.warn('Using default settings due to db fetch failure:', err);
    }

    // Format phone number
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('5')) {
      cleanPhone = '966' + cleanPhone;
    }

    let sendSuccess = false;
    let apiResponse = null;

    // 2. Dispatch based on Gateway Mode
    if (mode === 'evolution' && autoSendEnabled) {
      try {
        const cleanServer = evolutionServerUrl.replace(/\/+$/, '');
        const targetUrl = `${cleanServer}/message/sendText/${evolutionInstance}`;

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          },
          body: JSON.stringify({
            number: cleanPhone,
            text: message,
            options: {
              delay: 1200,
              presence: 'composing',
              linkPreview: true
            }
          })
        });

        apiResponse = await res.json();
        sendSuccess = res.ok;
      } catch (fetchErr: any) {
        console.error('Evolution API Fetch Error:', fetchErr);
        sendSuccess = false;
        apiResponse = { error: fetchErr.message };
      }
    } else {
      // Direct Web / Manual Mode
      sendSuccess = true;
      apiResponse = { mode: 'manual_or_web', direct_url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` };
    }

    // 3. Log notification to Supabase
    try {
      await supabase.from('notification_logs').insert([{
        contract_id: contract_id || null,
        customer_id: customer_id || null,
        phone: cleanPhone,
        message,
        recipient_role: recipient_role || 'customer',
        notification_type: notification_type || 'manual_notice',
        status: sendSuccess ? 'sent' : 'failed'
      }]);
    } catch (logErr) {
      console.error('Failed to write log to supabase:', logErr);
    }

    return NextResponse.json({
      success: sendSuccess,
      data: apiResponse,
      phone: cleanPhone
    });
  } catch (error: any) {
    console.error('WhatsApp API Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
