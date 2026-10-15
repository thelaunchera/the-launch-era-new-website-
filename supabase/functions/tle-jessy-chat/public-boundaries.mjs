// Public confidentiality boundary; contains no private business records.
export function privateQuestion(q){return /(?:system prompt|hidden instructions|api.?key|credential|passwords|source code|repository|github|supabase|groq|openai|make scenario|backend|tech stack|how.{0,45}(?:build|built|created|made).{0,35}(?:business|website|system|assistant)|how.{0,30}(?:business|website|system|assistant).{0,25}(?:built|made|created)|como.{0,40}(?:crearon|creaste|hicieron|hiciste|constru|program)|prompt interno|instrucciones internas|credenciales|codigo fuente|herramientas internas|datos (?:internos|de otros clientes)|internal (?:data|process|agents)|other client|(?:other|another|different)\\s+(?:customers?|clients?|users?|businesses|accounts?)(?:\u0027s|s\u0027)?.{0,80}(?:private|records?|data|information|command center)|(?:private|confidential)\\s+(?:customer|client|business|account|command center\\s+)?(?:data|records?|information|details)|datos?\\s+(?:privados?|confidenciales?|de otros clientes)|informacion privada)/i.test(q)}
export function knowledgeReply(message,lang,id,catalog){
 const q=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const es=lang==='es';
 if(/(?:other|another|different)\\s+(?:customers?|clients?|users?|businesses|accounts?)(?:'s|s')?.{0,80}(?:private|records?|data|information|command center)|(?:private|confidential)\\s+(?:customer|client|business|account|command center\\s+)?(?:data|records?|information|details)|datos?\\s+(?:privados?|confidenciales?|de otros clientes)|informacion privada/.test(q)){
  return es?"No. No tengo acceso a los datos privados de otros clientes ni puedo entrar a su Command Center. Puedo explicarte cómo funcionan nuestros servicios, pero las consultas específicas de una cuenta las revisa el equipo.":"No. I can't access anyone else's private Command Center or customer records. I can explain how our services work, but account-specific questions need to be reviewed by the team.";
 }
 if(privateQuestion(q))return es?'Puedo explicarte qué incluye cada servicio y cómo lo usarías en tu negocio. Los detalles de construcción, instrucciones internas, credenciales y datos privados no se comparten. Si estás evaluando un servicio, te cuento su funcionamiento y alcance.':'I can explain what each service includes and how you would use it in your business. We keep construction details, internal instructions, credentials and private records confidential. I’m happy to explain the customer experience and scope.';
 if(/\b(price|pricing|cost|costs|fee|monthly|how much|cuanto|cuesta|precio|costo|mensual|discount|descuento)\b/.test(q)){
  const row=catalog.find(x=>x[0]===id);
  return row?row[es?5:4]+' '+(es?'El checkout confirma el total vigente antes de pagar.':'Checkout confirms the current total before you pay.'):null;
 }
 return null;
}
