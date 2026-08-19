import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('Moyasar Webhook received:', payload);

    // 1. Check if payment is successful
    const eventType = payload.type || payload.event || 'payment_paid';
    const paymentData = payload.data || payload;
    const status = paymentData.status;

    if (status !== 'paid' && status !== 'captured' && eventType !== 'payment_paid') {
      return NextResponse.json({ success: true, message: `Ignored status: ${status}` });
    }

    // 2. Extract contract information from description / metadata / invoice
    const metadata = paymentData.metadata || {};
    const contractId = metadata.contract_id || payload.contract_id;
    const contractNumber = metadata.contract_number || payload.contract_number;
    const amount = (paymentData.amount ? paymentData.amount / 100 : payload.amount) || 0;
    const source = paymentData.source || {};
    
    let paymentMethod = 'mada';
    if (source.type === 'applepay' || source.company === 'applepay') {
      paymentMethod = 'apple_pay';
    } else if (source.type === 'creditcard' || source.company === 'visa' || source.company === 'master') {
      paymentMethod = 'credit_card';
    } else if (source.company === 'mada') {
      paymentMethod = 'mada';
    }

    const transactionRef = paymentData.id || `TXN_${Date.now()}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Update contract in Supabase
    if (contractId || contractNumber) {
      try {
        let query = supabase.from('contracts').update({
          payment_status: 'paid',
          paid_amount: amount,
          receipt_number: receiptNumber
        });

        if (contractId) {
          await query.eq('id', contractId);
        } else {
          await query.eq('contract_number', contractNumber);
        }

        // Insert official receipt
        await supabase.from('receipts').insert([{
          receipt_number: receiptNumber,
          contract_id: contractId || '00000000-0000-0000-0000-000000000000',
          customer_id: metadata.customer_id || '00000000-0000-0000-0000-000000000000',
          amount: amount,
          payment_method: paymentMethod,
          transaction_ref: transactionRef,
          notes: `سداد إلكتروني ناجح عبر Moyasar (${paymentMethod})`
        }]);

        // Insert internal in-app notification
        await supabase.from('notifications').insert([{
          title: `💰 تم استلام سداد إلكتروني (${amount} ريال)`,
          message: `تم سداد العقد (${contractNumber || contractId}) بنجاح عبر (${paymentMethod.toUpperCase()}) برقم سند ${receiptNumber}.`,
          type: 'payment_alert',
          is_read: false
        }]);

      } catch (dbErr) {
        console.error('Webhook database sync error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      receipt_number: receiptNumber,
      transaction_ref: transactionRef,
      status: 'paid'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
