-- Execute on Supabase TESTING project only. All writes are rolled back.
begin;
set local role booking_studio_qa_runner;
select set_config('booking_studio_qa.tenant_id','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
insert into booking_studio_qa.synthetic_requests
 (tenant_id,kind,service_name,service_area,frequency,estimated_total,consent_to_contact)
 values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','booking_request','Synthetic Standard Cleaning','Miami','weekly',126,true),
        ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quote_request','Synthetic Move-Out','Miami','one_time',null,true);
do $$
declare visible_count integer; denied_count integer; cross_tenant_denied boolean:=false; invalid_consent_denied boolean:=false;
begin
 select count(*) into visible_count from booking_studio_qa.synthetic_requests;
 if visible_count<>2 then raise exception 'expected two tenant A rows, got %',visible_count; end if;
 begin
  insert into booking_studio_qa.synthetic_requests
   (tenant_id,kind,service_name,service_area,frequency,consent_to_contact)
   values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','booking_request','Wrong tenant','Miami','weekly',true);
 exception when insufficient_privilege then cross_tenant_denied:=true;
 end;
 if not cross_tenant_denied then raise exception 'cross-tenant insert was not denied'; end if;
 begin
  insert into booking_studio_qa.synthetic_requests
   (tenant_id,kind,service_name,service_area,frequency,consent_to_contact)
   values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','booking_request','No consent','Miami','weekly',false);
 exception when check_violation then invalid_consent_denied:=true;
 end;
 if not invalid_consent_denied then raise exception 'missing consent was not denied'; end if;
 perform set_config('booking_studio_qa.tenant_id','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
 select count(*) into denied_count from booking_studio_qa.synthetic_requests;
 if denied_count<>0 then raise exception 'cross-tenant read leaked % rows',denied_count; end if;
 raise notice 'PASS: tenant A sees 2 synthetic rows, tenant B sees 0, cross-tenant insert and missing consent denied';
end $$;
reset role;
rollback;
