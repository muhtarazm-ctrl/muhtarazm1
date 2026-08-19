export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contract_id, contract_number, amount, customer_name, customer_phone, description } = body;

    if (!contract_id || !amount) {
      return NextResponse.json({ success: false, error: 'Contract ID and amount are required' }, { status: 400 });
    }

    // 1. Fetch Moyasar Payment Settings
    let secretKey = 'sk_test_muhtaraz_secret_key';
    let isEnabled = true;

    try {
      const { data: settings } = await supabase
        .from('payment_settings')
        .select('*')
        .limit(1)
        .single();

      if (settings) {
        isEnabled = settings.is_enabled;
        secretKey = settings.secret_key || secretKey;
      }
    } catch (err) {
      console.warn('Using default payment settings for invoice:', err);
    }

    if (!isEnabled) {
      return NextResponse.json({ success: false, error: 'Electronic payment is disabled by admin' }, { status: 400 });
    }

    // 2. Generate simulated or real Moyasar invoice URL
    // In production, you would call: https://api.moyasar.com/v1/invoices
    const invoiceId = `inv_${contract_number || Date.now()}`;
    const invoiceUrl = `https://checkout.moyasar.com/invoices/${invoiceId}?amount=${amount}`;

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      invoice_url: invoiceUrl,
      amount,
      contract_number,
      message: 'Payment link generated successfully'
    });
  } catch (error: any) {
    console.error('Error creating invoice link:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
