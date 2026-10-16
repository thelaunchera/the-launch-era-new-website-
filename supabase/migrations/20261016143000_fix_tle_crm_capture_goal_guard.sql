-- Fix: contact leads (and freebie requests) do not have a goal column.
-- PL/pgSQL AND conditions must not be relied on to short-circuit record field references.
-- Keep the personalized_demo_requests consent linking and CRM ingestion unchanged.
-- Applied and read back on production 2026-10-16; idempotent for future releases.
CREATE OR REPLACE FUNCTION public.tle_crm_capture_tle_inquiry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_business text;v_contact text;v_email text;v_source text;v_notes text;v_language text;v_lead uuid;begin if tg_table_name='personalized_demo_requests' then
 if left(coalesce(new.goal,''),13)='crm_interest:' then
 if substring(new.goal from 14) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
  select id into v_lead from public.tle_crm_leads
  where id=substring(new.goal from 14)::uuid
   and workspace_id='c0b24907-3a17-4273-b00c-70efbba314c4'::uuid
   and lower(trim(email))=lower(trim(new.email))
   and lower(trim(business))=lower(trim(new.business_name))
   and archived_at is null and email_consent_status='authorized'
  limit 1;
  if v_lead is not null then
   insert into public.tle_crm_source_links(source_type,source_id,lead_id)
   values('personalized_demo_requests',new.id,v_lead) on conflict do nothing;
  end if;
 end if;
 return new;
end if;
end if; if tg_table_name='tle_contact_leads' then v_business=nullif(trim(new.business_name),'');v_contact=new.name;v_email=new.email;v_source='Website · '||coalesce(new.source,'contact');v_notes=coalesce(new.message,'');v_language=new.language;elsif tg_table_name='personalized_demo_requests' then v_business=nullif(trim(new.business_name),'');v_contact=new.name;v_email=new.email;v_source='Demo request';v_notes=concat_ws(' · ',new.service_area,new.services,new.goal);v_language='en';elsif tg_table_name='tle_freebie_requests' then v_business=null;v_contact=null;v_email=new.email;v_source='Freebie · '||coalesce(new.campaign,new.source,'download');v_notes=concat_ws(' · ',new.content,new.landing_path);v_language=new.language;else return new;end if;if nullif(trim(coalesce(v_email,'')),'') is null then return new;end if;insert into public.tle_crm_leads(workspace_id,business,contact,email,source,language,stage,notes,email_consent_status,email_followup_enabled) values('c0b24907-3a17-4273-b00c-70efbba314c4'::uuid,coalesce(v_business,nullif(trim(v_contact),''),v_email),v_contact,v_email,v_source,coalesce(nullif(trim(v_language),''),'en'),'New',left(v_notes,3500),'unknown',false) returning id into v_lead;insert into public.tle_crm_source_links(source_type,source_id,lead_id) values(tg_table_name,new.id,v_lead) on conflict do nothing;return new;end $function$
;
