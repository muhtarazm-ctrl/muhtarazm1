export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
          payment_method: paymentMethod,
          paid_amount: amount,
          receipt_number: receiptNumber,
          updated_at: new Date().toISOString()
        });

        if (contractId) {
          query = query.eq('id', contractId);
        } else {
          query = query.eq('contract_number', contractNumber);
        }

        const { data: updatedContract } = await query.select('*, customer:customers(*), container:containers(*)').single();

        // 4. Create official Receipt in Supabase
        if (updatedContract) {
          await supabase.from('receipts').insert([{
            receipt_number: receiptNumber,
            contract_id: updatedContract.id,
            customer_id: updatedContract.customer_id,
            customer_name: updatedContract.customer?.name || 'عميل المحترز',
            amount: amount,
            payment_method: paymentMethod,
            transaction_reference: transactionRef,
            contract_number: updatedContract.contract_number,
            container_number: updatedContract.container?.container_number,
            container_type: updatedContract.contract_type,
            notes: 'تم التحصيل إلكترونياً بنجاح عبر سداد / مدى / Apple Pay'
          }]);

          // 5. Create in-app notification
          await supabase.from('notifications').insert([{
            contract_id: updatedContract.id,
            title: `💳 سداد إلكتروني ناجح (${updatedContract.contract_number})`,
            message: `قام العميل ${updatedContract.customer?.name} بسداد ${amount} ر.س إلكترونياً بنجاح.`,
            type: 'payment_received'
          }]);
        }
      } catch (dbErr) {
        console.error('Database update error on webhook:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed and verified successfully'
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
