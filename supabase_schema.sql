-- ==============================================================================
-- SUPABASE DATABASE SETUP FOR RESTAURANT ORDERS (Part A Hackathon Project)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Create the 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE, -- Daraz-style Tracking ID (e.g. DW-784291)
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_email TEXT,
    items JSONB NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Default status is 'Pending'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index for faster querying by order_number, creation date and status
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone (public/anon key) to insert orders
CREATE POLICY "Allow public order insertion" 
ON public.orders 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow public / authorized reads of orders
CREATE POLICY "Allow reading orders" 
ON public.orders 
FOR SELECT 
TO public 
USING (true);

-- Allow public / authorized status updates for tracking simulation
CREATE POLICY "Allow order status updates" 
ON public.orders 
FOR UPDATE 
TO public 
USING (true);

-- ==============================================================================
-- Verification Query
-- ==============================================================================
-- SELECT order_number, customer_name, total_price, status, created_at FROM public.orders ORDER BY created_at DESC;
