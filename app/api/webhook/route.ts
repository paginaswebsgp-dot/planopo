import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_placeholder') {
    // En desarrollo sin webhook configurado, procesamos igualmente
    console.log('⚠️  Webhook sin secret configurado');
    return NextResponse.json({ received: true });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  const admin = getAdmin();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (userId) {
        await admin.from('perfiles').update({
          es_premium: true,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          premium_desde: new Date().toISOString(),
        }).eq('id', userId);
        console.log('✅ Usuario premium activado:', userId);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      await admin.from('perfiles').update({
        es_premium: false,
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', customerId);
      console.log('❌ Premium cancelado para customer:', customerId);
      break;
    }
    case 'invoice.payment_failed': {
      console.log('⚠️  Pago fallido:', event.data.object);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
