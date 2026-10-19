-- TESTING ONLY (afyiltvdfqnuyzcqsnoh). Run once; this creates two synthetic QA identities.
-- Never run in production. No real buyer, booking, payment, email or invitation is created.
-- Synthetic identities have no password. Operator QA may generate and consume a no-send magic link internally.
with fixture_users as (
 insert into auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,encrypted_password,confirmation_token,recovery_token,email_change_token_new,email_change)
 select id,'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
 'tle-assistant-qa+'||id::text||'@example.invalid',now(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 jsonb_build_object('qa_fixture',true,'purpose','customer_assistant_testing','label',label),now(),now(),'','','','',''
 from (select gen_random_uuid() as id,label from (values ('A'),('B')) labels(label)) fixtures
 returning id,raw_user_meta_data->>'label' as label
), new_workspaces as (
 insert into public.tle_crm_workspaces(id,name,created_by,is_internal)
 select gen_random_uuid(),'[QA ONLY] TLE Sample Cleaning '||label,id,false from fixture_users
 returning id,name,created_by
), new_accounts as (
 insert into public.tle_booking_flow_accounts(id,crm_workspace_id,payment_status,intake_completed_at,delivery_sent_at,status,business_name,business_category,booking_public_key,booking_page_url,timezone)
 select gen_random_uuid(),id,'paid',now(),now(),'active',name,'cleaning',gen_random_uuid(),'https://thelaunchera.com/base-booking.html','America/New_York'
 from new_workspaces returning id,crm_workspace_id,business_name,booking_public_key
), configs as (
 insert into public.tle_customer_assistant_configs(account_id,enabled,knowledge_en,knowledge_es,approved_by,approved_at)
 select a.id,true,
 case when a.business_name like '% A' then 'Synthetic QA business A. Offers Deep Cleaning A. Owner reviews every request. No real customers or emails.' else 'Synthetic QA business B. Offers Office Cleaning B. Owner reviews every request. No real customers or emails.' end,
 'Negocio ficticio de pruebas. La persona encargada revisa todas las solicitudes. No hay clientes reales.',
 w.created_by,now()
 from new_accounts a join new_workspaces w on w.id=a.crm_workspace_id returning account_id
), prices as (
 insert into public.tle_booking_flow_pricing(account_id,services)
 select id,jsonb_build_array(jsonb_build_object('id',case when business_name like '% A' then 'deep-a' else 'office-b' end,'name',case when business_name like '% A' then 'Deep Cleaning A' else 'Office Cleaning B' end,'mode','quote','active',true))
 from new_accounts returning account_id
)
select id as account_id,crm_workspace_id,business_name,booking_public_key from new_accounts;
