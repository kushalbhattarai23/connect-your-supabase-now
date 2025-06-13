
-- Remove the person column from the loans interface since it doesn't exist in the database
-- The loans table already has the correct structure, we just need to make sure the code matches

-- Let's check if there are any constraints or issues with the loans table
-- and ensure it has all necessary columns for proper functionality

-- Add any missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_type ON public.loans(type);

-- Add RLS policies for loans table if they don't exist
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own loans
DROP POLICY IF EXISTS "Users can view their own loans" ON public.loans;
CREATE POLICY "Users can view their own loans" 
  ON public.loans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own loans
DROP POLICY IF EXISTS "Users can create their own loans" ON public.loans;
CREATE POLICY "Users can create their own loans" 
  ON public.loans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own loans
DROP POLICY IF EXISTS "Users can update their own loans" ON public.loans;
CREATE POLICY "Users can update their own loans" 
  ON public.loans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own loans
DROP POLICY IF EXISTS "Users can delete their own loans" ON public.loans;
CREATE POLICY "Users can delete their own loans" 
  ON public.loans 
  FOR DELETE 
  USING (auth.uid() = user_id);
