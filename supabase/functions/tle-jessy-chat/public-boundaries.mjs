// Public confidentiality boundary; contains no private business records.
export function privateQuestion(q){return /(?:system prompt|hidden instructions|api.?key|credential|passwords|source code|repository|github|supabase|groq|openai|make scenario|backend|tech stack|how.{0,45}(?:build|built|created|made).{0,35}(?:business|website|system|assistant)|how.{0,30}(?:business|website|system|assistant).{0,25}(?:built|made|created)|como.{0,40}(?:crearon|creaste|hicieron|hiciste|constru|program)|prompt interno|instrucciones internas|credenciales|codigo fuente|herramientas internas|datos (?:internos|de otros clientes)|internal (?:data|process|agents)|other client)/i.test(q)}
export function knowledgeReply(message,lang,id,catalog){
 const q=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const es=lang==='es';
 if(privateQuestion(q))return es?'Puedo explicarte qué incluye cada servicio y cómo lo usarías en tu negocio. Los detalles de construcción, instrucciones internas, credenciales y datos privados no se comparten. Si estás evaluando un servicio, te cuento su funcionamiento y alcance.':'I can explain what each service includes and how you would use it in your business. We keep construction details, internal instructions, credentials and private records confidential. I’m happy to explain the customer experience and scope.';
 if(/\b(price|pricing|cost|costs|fee|monthly|how much|cuanto|cuesta|precio|costo|mensual|discount|descuento)\b/.test(q)){
  const row=catalog.find(x=>x[0]===id);
  return row?row[es?5:4]+' '+(es?'El checkout confirma el total vigente antes de pagar.':'Checkout confirms the current total before you pay.'):null;
 }
 return null;
}
