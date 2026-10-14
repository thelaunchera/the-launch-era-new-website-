import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const migration=await readFile("supabase/testing-only/20261014_booking_studio_qa_isolation.sql","utf8");
const qa=await readFile("supabase/testing-only/qa_booking_studio_rollback.sql","utf8");
for(const phrase of [
 "TESTING PROJECT ONLY","create schema if not exists booking_studio_qa",
 "revoke all on schema booking_studio_qa from public, anon, authenticated",
 "nologin nobypassrls","enable row level security","force row level security",
 "for all to booking_studio_qa_runner","with check (tenant_id =",
 "check (consent_to_contact)","check (not customer_notified)","check (synthetic_only)"
])assert.ok(migration.toLowerCase().includes(phrase.toLowerCase()),"Missing staging isolation: "+phrase);
for(const phrase of [
 "All writes are rolled back","set local role booking_studio_qa_runner",
 "cross-tenant insert was not denied","missing consent was not denied",
 "cross-tenant read leaked","revoke booking_studio_qa_runner from postgres","rollback;"
])assert.ok(qa.includes(phrase),"Missing staging QA control: "+phrase);
assert.doesNotMatch(migration,/tle_booking_flow_accounts|tle_crm_leads|tle_crm_workspaces/i);
assert.doesNotMatch(qa,/tle_booking_flow_accounts|tle_crm_leads|tle_crm_workspaces/i);
console.log("Booking Studio Supabase staging: 20 isolation, RLS and rollback contract checks passed.");
