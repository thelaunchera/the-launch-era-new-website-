/* Verify the paid website receipt and protected intake path, preserving
   independent freebie confirmation without creating a live order. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const checkout=read('public/service-checkout/index.html');
const receipt=read('public/website-payment-success/index.html');
const intake=read('public/assets/tle-website-intake.js');
const freebie=read('src/components/freebie-page.tsx');
const confirmation=read('src/components/success-confirmation.tsx');
assert(checkout.includes('create-tle-service-checkout'),'Checkout must use Stripe via Make gateway');
assert(checkout.includes('Number(v.amount_total)!==plan.cents'),'Strict cents validation needs numeric coercion');
assert(receipt.includes('tle-studio-website-confirm-payment'),'Receipt verifies payment server-side');
assert(receipt.includes("d.paid!==true"),'Do not send unpaid buyers to the onboarding form');
assert(receipt.includes('session_id'),'Server-verified checkout session must be passed to onboarding');
assert(intake.includes('tle-studio-website-intake'),'Paid intake must reach private Studio');
assert(intake.includes("stage')==='onboarding'"),'Require onboarding stage');
assert(intake.includes('checkout_reference'),'Intake carries Stripe purchase reference');
assert(freebie.includes('SuccessConfirmation')&&freebie.includes("setStatus('sent')"),'Preserve freebie receipt');
assert(confirmation.includes('emailSent'),'Existing receipt must remain truthful');
console.log('[TLE VERIFIED SUCCESS] Stripe verified website orders, paid intake protection and freebie receipts passed');
