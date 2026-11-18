-- Product option groups for product customization (combo-style)
CREATE TABLE product_option_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  selection_type text NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single', 'quantity')),
  min_select int NOT NULL DEFAULT 1,
  max_select int,
  is_required boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

-- Options within each group
CREATE TABLE product_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES product_option_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  price_delta numeric(10,2) NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);

-- Index for fast lookups
CREATE INDEX idx_option_groups_product_id ON product_option_groups(product_id);
CREATE INDEX idx_options_group_id ON product_options(group_id);

-- Enable RLS
ALTER TABLE product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read option groups"
  ON product_option_groups FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read product options"
  ON product_options FOR SELECT
  USING (true);

-- Admin write
CREATE POLICY "Admins can manage option groups"
  ON product_option_groups
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "Admins can manage product options"
  ON product_options
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');
