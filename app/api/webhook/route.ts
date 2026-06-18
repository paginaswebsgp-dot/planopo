import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  // Si no hay webhook secret configurado aún, solo logueamos
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_placeholder') {
    console.log('⚠️  Webhook recibido pero STRIPE_WEBHOOK_SECRET no configurado');
    return NextResponse.json({ received: true });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    console.error('Webhook signature error:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // Manejar eventos de Stripe
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('✅ Pago completado:', session.id);
      console.log('   Customer:', session.customer);
      console.log('   Subscription:', session.subscription);
      // Aquí actualizarías tu BD para marcar al usuario como Premium
      // Ejemplo con Supabase: await supabase.from('users').update({ premium: true }).eq('stripe_customer', session.customer)
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('❌ Suscripción cancelada:', subscription.id);
      // Aquí quitarías el premium al usuario
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('⚠️  Pago fallido:', invoice.id);
      // Aquí podrías enviar un email al usuario
      break;
    }

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
