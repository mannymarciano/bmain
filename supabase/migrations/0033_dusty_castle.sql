-- Create stripe_prices table
CREATE TABLE stripe_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id text NOT NULL UNIQUE,
  stripe_product_id text NOT NULL,
  plan_id text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  currency text NOT NULL DEFAULT 'usd',
  unit_amount integer NOT NULL,
  recurring_interval text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add RLS
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to active prices" ON stripe_prices
  FOR SELECT TO authenticated
  USING (active = true);

-- Add function to handle price updates
CREATE OR REPLACE FUNCTION handle_price_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price updates
CREATE TRIGGER on_price_updated
  BEFORE UPDATE ON stripe_prices
  FOR EACH ROW
  EXECUTE FUNCTION handle_price_updated();