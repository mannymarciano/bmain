import Stripe from 'stripe';
import { supabase } from '../lib/supabase';
import { TRIAL_PERIOD_DAYS } from '../config/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCustomer(userId: string, email: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId
    }
  });

  await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer;
}

export async function createSubscription(
  customerId: string,
  priceId: string
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: TRIAL_PERIOD_DAYS,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription'
    },
    expand: ['latest_invoice.payment_intent']
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations'
  });
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}