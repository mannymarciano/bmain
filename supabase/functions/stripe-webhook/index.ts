import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            stripe_subscription_id: subscription.id,
            user_id: subscription.metadata.userId,
            stripe_customer_id: subscription.customer,
            plan_id: subscription.metadata.planId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            trial_end: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000) 
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date()
          }, {
            onConflict: 'stripe_subscription_id'
          });

        if (error) throw error;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            updated_at: new Date()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) throw error;
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});