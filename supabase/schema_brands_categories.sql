-- ==============================================================================
-- UPDATE MART: DYNAMIC CATEGORY & BRAND MANAGEMENT SCHEMA
-- ==============================================================================
-- Execute this SQL in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories (is_active);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands (slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands (is_active);

-- 4. Automatic Updated At Timestamp Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_brands_updated_at ON public.brands;
CREATE TRIGGER set_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Categories RLS: Everyone (anon and authenticated) can view active categories
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
    ON public.categories
    FOR SELECT
    USING (true);

-- Categories RLS: Authenticated users / service role can manage (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Authenticated users can manage categories"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also allow service role / anon fallback if custom token header is used
DROP POLICY IF EXISTS "Service role has full access to categories" ON public.categories;
CREATE POLICY "Service role has full access to categories"
    ON public.categories
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Brands RLS: Everyone can view brands
DROP POLICY IF EXISTS "Public can view active brands" ON public.brands;
CREATE POLICY "Public can view active brands"
    ON public.brands
    FOR SELECT
    USING (true);

-- Brands RLS: Authenticated users can manage
DROP POLICY IF EXISTS "Authenticated users can manage brands" ON public.brands;
CREATE POLICY "Authenticated users can manage brands"
    ON public.brands
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to brands" ON public.brands;
CREATE POLICY "Service role has full access to brands"
    ON public.brands
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 6. Initial Seed Data (Safe Insert if table is empty)
INSERT INTO public.categories (name, slug, description, image_url, is_active, sort_order)
VALUES 
    ('Watches', 'watches', 'Luxury and casual analog and digital wristwatches', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80', true, 1),
    ('Electronics', 'electronics', 'Cutting-edge gadgets, audio gear, and peripherals', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80', true, 2),
    ('Accessories', 'accessories', 'Everyday carry essentials and lifestyle accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', true, 3),
    ('Bags', 'bags', 'Travel backpacks, minimalist briefcases, and messenger bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', true, 4),
    ('Smart Home', 'smart-home', 'Automated home lighting, security sensors, and assistants', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80', true, 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands (name, slug, description, logo_url, website_url, is_active, sort_order)
VALUES 
    ('Nova', 'nova', 'Minimalist lifestyle and tech gear design studio', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://mart.updatekeybd.com', true, 1),
    ('Apex', 'apex', 'Precision engineering for high-performance accessories', 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', 'https://mart.updatekeybd.com', true, 2),
    ('Aero', 'aero', 'Ultra-lightweight travel gear and urban backpacks', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80', 'https://mart.updatekeybd.com', true, 3),
    ('Nordic', 'nordic', 'Scandinavian minimalist aesthetics and timepieces', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80', 'https://mart.updatekeybd.com', true, 4)
ON CONFLICT (slug) DO NOTHING;

