
-- Ensure the person column exists in the loans table
-- This should already exist based on the schema, but let's make sure
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS person text;

-- Update any existing loans to have a default person value if needed
UPDATE public.loans 
SET person = 'Unknown' 
WHERE person IS NULL;
