-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET enable_signup = true, 
    confirm_email = false, 
    secure_email_change_enabled = false;

-- Alternatively, if the above doesn't work, we can use a different approach
-- Since we can't directly modify auth.config, we'll ensure our trigger handles unconfirmed users

-- Update the handle_new_user function to work with unconfirmed users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário')
  );
  RETURN NEW;
END;
$$;