// Shared validation. Model output is an untrusted draft, never an instruction to send.
export const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const clean = (value, max = 300) => typeof value === 'string' ? value.replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max) : '';
export function catalog(rows) {
  return (Array.isArray(rows) ? rows : []).filter(s => s?.active === true && clean(s.id, 80) && clean(s.name, 120)).slice(0, 30).map(s => ({id: clean(s.id, 80), name: clean(s.name, 120)}));
}
export function draft(raw, services) {
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const result = {};
  for (const [key, max] of Object.entries({property_type:80, bedrooms:10, bathrooms:10, square_feet:20, frequency:60, address:350, city:100, state:40, zip:10, date:10, time:5, customer_name:120, customer_email:200, customer_phone:40, notes:300})) {
    result[key] = clean(typeof value[key] === 'number' ? String(value[key]) : value[key], max);
  }
  result.service_id = services.some(s => s.id === value.service_id) ? value.service_id : '';
  if (!/^\d{5}(?:-\d{4})?$/.test(result.zip)) result.zip = '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date) || !Number.isFinite(Date.parse(result.date)) || new Date(result.date).toISOString().slice(0, 10) !== result.date) result.date = '';
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(result.time)) result.time = '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.customer_email)) result.customer_email = '';
  return result;
}
export function history(raw) {
  return (Array.isArray(raw) ? raw : []).filter(x => ['user','assistant'].includes(x?.role) && clean(x.content, 500)).slice(-12).map(x => ({role:x.role, content:clean(x.content,500)}));
}
export function safeReply(value, lang) {
  const reply = clean(value, 380);
  // Never pass through a model's claim of a completed action, price or availability.
  if (!reply || /[$€£]|\b\d+(?:\.\d+)?\s*(?:USD|dollars?|d[oó]lares?)|\b(?:booked|confirmed|reserved|sent|paid|available|disponible|confirmad[oa]|reservad[oa]|enviad[oa]|pagad[oa])\b/i.test(reply)) {
    return lang === 'es' ? 'Puedes revisar los datos y enviar tu solicitud. El negocio confirmará el horario y el precio.' : 'You can review the details and send your request. The business will confirm the time and price.';
  }
  return reply;
}
export function validateSubmission(value, services, today) {
  const missing = ['service_id','property_type','address','city','state','zip','date','time','customer_name','customer_email','customer_phone'].filter(key => !value[key]);
  if (value.date && value.date < today) missing.push('future_date');
  if (!services.some(s => s.id === value.service_id)) missing.push('service_id');
  return [...new Set(missing)];
}
export function submissionBody(input, services, today) {
  const value = draft(input.draft, services);
  const missing = validateSubmission(value, services, today);
  if (input.confirmed !== true || !/^req_[0-9a-f-]{36}$/i.test(input.external_ref || '') || missing.length) {
    return {error:'Review and confirm the required details before submitting.', missing};
  }
  // Force owner review, including for published flat-price services. No auto slot claim.
  const service = services.find(s => s.id === value.service_id);
  const recent = history(input.history).slice(-4);
  const transcript = recent.map(x => (x.role === 'user' ? 'Customer: ' : 'Assistant: ') + x.content).join('\n');
  const detail = [value.notes, 'Property: '+value.property_type, value.bedrooms && 'Bedrooms: '+value.bedrooms, value.bathrooms && 'Bathrooms: '+value.bathrooms, value.square_feet && 'Size: '+value.square_feet, value.frequency && 'Frequency: '+value.frequency].filter(Boolean).join(' · ');
  // Existing inquiry endpoint stores at most 1,200 characters of notes. Label partial history honestly.
  const notes = (detail.slice(0,350)+'\nRecent chat excerpt (customer supplied):\n'+transcript.slice(-760)).slice(0,1200);
  return {body:{booking_key:input.booking_key, external_ref:input.external_ref.toLowerCase(), source:'website_assistant', request_type:'quote', request_intent:'quote', service_id:service.id, service_name:service.name, customer_name:value.customer_name, customer_email:value.customer_email.toLowerCase(), customer_phone:value.customer_phone, preferred_language:input.language==='es'?'es':'en', service_address:[value.address,value.city,value.state,value.zip].join(', '), requested_date:value.date, requested_time:value.time, property_type:value.property_type, bedrooms:value.bedrooms, bathrooms:value.bathrooms, square_footage:value.square_feet, frequency:value.frequency, notes, optional_care_opt_in:false, appointment_reminders_opt_in:false}};
}
