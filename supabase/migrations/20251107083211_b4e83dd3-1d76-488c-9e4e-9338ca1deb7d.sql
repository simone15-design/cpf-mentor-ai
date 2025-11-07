-- Drop the overly permissive public policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create a new policy requiring authentication to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);