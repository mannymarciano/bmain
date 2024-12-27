import { supabase } from '../lib/supabase';
import { createCustomer, createSubscription } from './stripeService';
import { Plan } from '../types/subscription';

export async function subscribeToPlan(plan: Plan, userId: string, email: string) {
  try {
    // Get Stripe price ID for plan
    const { data: priceData, error: priceError } = await supabase
      .from('stripe_prices')
      .select('stripe_price_id')
      .eq('plan_id', plan.id)
      .eq('active', true)
      .single();

    if (priceError || !priceData) {
      throw new Error('Plan price not found');
    }

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = userData?.stripe_customer_id;
    if (!customerId) {
      const customer = await createCustomer(userId, email);
      customerId = customer.id;
    }

    // Create subscription
    const subscription = await createSubscription(
      customerId,
      priceData.stripe_price_id
    );

    return subscription;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw error;
  }
}

export async function getCurrentPlan(userId: string): Promise<Plan | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        plan_id,
        status,
        trial_end,
        current_period_end
      `)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    // Get plan details
    const { data: planData } = await supabase
      .from('stripe_prices')
      .select('*')
      .eq('plan_id', data.plan_id)
      .eq('active', true)
      .single();

    return planData ? {
      ...planData,
      status: data.status,
      trialEnd: data.trial_end,
      currentPeriodEnd: data.current_period_end
    } : null;
  } catch (error) {
    console.error('Failed to get current plan:', error);
    return null;
  }
}