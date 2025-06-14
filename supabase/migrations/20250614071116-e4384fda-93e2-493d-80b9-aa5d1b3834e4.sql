
-- Update the loans table to only include the necessary columns
-- First, let's see what columns we currently have and remove unnecessary ones

-- Remove any unnecessary columns that might exist
ALTER TABLE public.loans DROP COLUMN IF EXISTS status;
ALTER TABLE public.loans DROP COLUMN IF EXISTS updated_at;

-- Ensure all required columns exist with correct types
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS person text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'Personal',
ADD COLUMN IF NOT EXISTS amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS description text;

-- Make sure person column is not nullable since it's required
ALTER TABLE public.loans ALTER COLUMN person SET NOT NULL;
ALTER TABLE public.loans ALTER COLUMN person SET DEFAULT '';

-- Update any existing loans that might have null person values
UPDATE public.loans 
SET person = 'Unknown' 
WHERE person IS NULL OR person = '';
