-- =====================================================================
-- TORNAR UM USUÁRIO ADMINISTRADOR
-- 1) No Supabase: Authentication → Users → "Add user" → "Create new user"
--    (informe seu e-mail e uma senha forte; marque "Auto Confirm User").
-- 2) Troque o e-mail abaixo pelo seu e rode este script no SQL Editor.
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'SEU-EMAIL@exemplo.com'
on conflict (user_id) do nothing;

-- Conferir:
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
