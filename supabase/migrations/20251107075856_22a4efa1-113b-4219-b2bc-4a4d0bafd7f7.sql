-- Create a function to get user ID by email (security definer to access auth.users)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_param text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = email_param LIMIT 1;
$$;