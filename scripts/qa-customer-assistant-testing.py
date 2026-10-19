"""Explicit operator-run synthetic Testing API check. No production requests or real email recipients."""
import json,urllib.request,urllib.error
BASE='https://afyiltvdfqnuyzcqsnoh.supabase.co/functions/v1/tle-customer-assistant'
for suffix,key,service,lang in [('1','a040b6d1-c073-47cd-b923-f51576dd1111','deep-a','en'),('2','cdc38a40-968d-4b54-beb0-1b22a6d043b5','office-b','es')]:
 payload=dict(action='submit',booking_key=key,language=lang,confirmed=True,external_ref='req_11111111-2222-4333-8444-55555555555'+suffix,appointment_reminders_opt_in=suffix=='2',optional_care_opt_in=suffix=='2',history=[dict(role='user',content='[QA ONLY] Testing saved conversation '+suffix)],draft=dict(service_id=service,property_type='Office',address='123 Example Road, Suite 4',city='Example City',state='NY',zip='10001',date='2099-10-21',time='09:00',customer_name='[QA ONLY] Sample Customer',customer_email='qa@example.invalid',customer_phone='2025550100'))
 for step in ['submit','retry','changed-consent']:
  if step=='changed-consent': payload['optional_care_opt_in']=not payload['optional_care_opt_in']
  req=urllib.request.Request(BASE,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Origin':'https://thelaunchera.com'})
  try:
   with urllib.request.urlopen(req,timeout=40) as r: status,data=r.status,json.load(r)
  except urllib.error.HTTPError as e: status,data=e.code,json.load(e)
  print(suffix,step,status,json.dumps(data),flush=True)
  assert status==(409 if step=='changed-consent' else 200)
  if step!='changed-consent':
   assert data['booking_confirmed'] is False
   assert data['customer_email_accepted'] is False
   if step=='retry': assert data['duplicate'] is True
print('PASS real Testing submission, safe retry, immutable consent; synthetic no-email fixtures')
