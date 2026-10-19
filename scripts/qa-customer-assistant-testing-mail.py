"""Authorized Testing-only sends, fixed references, sole real recipient hello@thelaunchera.com."""
import json,urllib.request,urllib.error
URL='https://afyiltvdfqnuyzcqsnoh.supabase.co/functions/v1/tle-customer-assistant'
for suffix,key,svc,mail,lang in [('4','cdc38a40-968d-4b54-beb0-1b22a6d043b5','office-b','hello@thelaunchera.com','es'),('5','a040b6d1-c073-47cd-b923-f51576dd1111','deep-a','qa@example.invalid','en')]:
 payload=dict(action='submit',booking_key=key,language=lang,confirmed=True,external_ref='req_11111111-2222-4333-8444-55555555555'+suffix,optional_care_opt_in=suffix=='4',appointment_reminders_opt_in=suffix=='4',history=[dict(role='user',content='QA TEST ONLY — authorized email test '+suffix)],draft=dict(service_id=svc,property_type='Office',address='123 Example Road, Suite 4',city='Example City',state='NY',zip='10001',date='2099-10-21',time='09:00',customer_name='QA TEST Sample Customer',customer_email=mail,customer_phone='2025550100'))
 saved=None
 for step in ['submit','retry']:
  req=urllib.request.Request(URL,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Origin':'https://thelaunchera.com'})
  try:
   with urllib.request.urlopen(req,timeout=45) as r: status,data=r.status,json.load(r)
  except urllib.error.HTTPError as e: status,data=e.code,json.load(e)
  print(suffix,step,status,json.dumps(data),flush=True)
  assert status==200 and data['ok'] and data['booking_confirmed'] is False
  assert data['customer_email_accepted']==(suffix=='4')
  assert data['owner_email_accepted']==(suffix=='5')
  if saved: assert data['request_id']==saved and data['duplicate'] is True
  saved=data['request_id']
print('PASS real receipt and owner alert accepted; repeated submission retained the same request')
