/* The Launch Era / fictional Cleaning App sample. Public showcase only.
   This module never connects to Supabase, auth, real records, email or payments. */
(function(){
 const params=new URLSearchParams(location.search);
 const names=["Sarah Mitchell","Amanda Brooks","Jessica Moore","Maria Ortiz","Emily Parker","Olivia Harris","David Turner","Melissa Cruz","Lauren Bennett","Noah Foster","Rachel Adams","Sofia Reynolds","Christopher Lee","Ashley Rivera","Daniel Martin","Natalie Scott","Benjamin Cooper","Victoria Lewis","Carla Romero","Hannah Carter","Ethan Williams","Grace Thompson","Mia Anderson","Alex Johnson","Isabella Perez","Jacob Collins","Chloe Davis","Michael Walker","Kayla Morris","Madison Baker"];
 const services=["Standard cleaning","Deep cleaning","Recurring cleaning","Move-out cleaning","Condo cleaning","Airbnb turnover","Office cleaning"];
 const serviceES=["Limpieza estándar","Limpieza profunda","Limpieza recurrente","Limpieza de mudanza","Limpieza de condo","Cambio de Airbnb","Limpieza de oficina"];
 const areas=["West Palm Beach area","Boynton Beach area","Lake Worth area","Delray Beach area","Palm Beach Gardens area","Wellington area"];
 const crew=["Mia Carter","Daniel Ortiz","Sofia Grant","Emily Hayes"];
 const clients=names.map((name,i)=>({name,id:"CL-"+(210+i),area:areas[i%6],frequency:["Weekly","Biweekly","Monthly","One-time"][i%4]}));
 const jobs=clients.slice(0,20).map((c,i)=>({name:c.name,service:i%7,crew:crew[i%4],day:i%10,time:["8:00 AM","9:30 AM","10:30 AM","1:00 PM","2:30 PM"][i%5],status:["Scheduled","Scheduled","Completed","In progress"][i%4]}));
 const quotes=clients.slice(10,18).map((c,i)=>({name:c.name,service:(i+1)%7,amount:155+i*35,status:["Pending","Accepted","Follow-up","Draft"][i%4],id:"QT-"+(2040+i)}));
 const invoices=clients.slice(0,12).map((c,i)=>({name:c.name,amount:135+(i%7)*38,status:["Paid","Sent","Paid","Overdue","Pending"][i%5],method:["Zelle","Cash","Check"][i%3],id:"INV-"+(1048+i)}));
 const requests=clients.slice(20,26).map((c,i)=>({name:c.name,service:(i+2)%7,status:["New inquiry","Pending review","Booked","Follow-up","New inquiry","Declined"][i]}));
 const word={
 en:{jobs:"Jobs",clients:"Clients",quotes:"Quotes",invoices:"Invoices",team:"Team",requests:"Requests",pricing:"Pricing Calculator",routes:"Routes",people:"Client directory",calendar:"Weekly calendar",jobList:"Upcoming jobs",queue:"Quote pipeline",billed:"Invoice history",members:"Team assignments",stops:"Routes and mileage",inbox:"Booking requests",showing:"sample records",note:"All names, prices and activity are fictional. Nothing here accesses real client accounts.",frequency:"Frequency",area:"Service area",amount:"Amount"},
 es:{jobs:"Trabajos",clients:"Clientes",quotes:"Cotizaciones",invoices:"Facturas",team:"Equipo",requests:"Solicitudes",pricing:"Calculadora de precios",routes:"Rutas",people:"Directorio de clientes",calendar:"Calendario semanal",jobList:"Próximos trabajos",queue:"Cotizaciones",billed:"Facturas de ejemplo",members:"Equipo asignado",stops:"Rutas y millaje",inbox:"Solicitudes recibidas",showing:"registros de ejemplo",note:"Todos los nombres, precios y actividades son ficticios. Aquí no se accede a cuentas de clientes reales.",frequency:"Frecuencia",area:"Zona de servicio",amount:"Cantidad"}
 };
 const w=()=>word[state.lang];const service=i=>(state.lang==="es"?serviceES:services)[i%7];
 const statuses={Paid:["Paid","Pagado"],Sent:["Sent","Enviado"],Overdue:["Overdue","Vencido"],Pending:["Pending","Pendiente"],Scheduled:["Scheduled","Agendado"],Completed:["Completed","Completado"],Accepted:["Accepted","Aceptado"],Draft:["Draft","Borrador"],"In progress":["In progress","En progreso"],"Follow-up":["Follow-up","Seguimiento"],"New inquiry":["New inquiry","Nueva solicitud"],"Pending review":["Pending review","Por revisar"],Booked:["Booked","Reservado"],Declined:["Declined","Rechazado"]};
 const status=s=>statuses[s]?.[state.lang==="es"?1:0]||s;
 const pill=s=>'<span class="tag '+(["Paid","Completed","Accepted","Booked"].includes(s)?"done":"draft")+'">'+status(s)+'</span>';
 const line=(name,detail,s)=>'<div class="data-row sample-detailed"><div class="sample-person"><span class="sample-avatar">'+name.split(" ").slice(0,2).map(a=>a[0]).join("")+'</span><div><strong>'+name+'</strong><small>'+detail+'</small></div></div><div class="right">'+pill(s)+'</div></div>';
 const title=(s,n)=>'<section class="populated"><h3>'+s+'</h3><p>'+n+' '+w().showing+'</p>';
 const date=(i)=>{const d=new Date();d.setDate(d.getDate()+i);return new Intl.DateTimeFormat(state.lang==="es"?"es-US":"en-US",{month:"short",day:"numeric"}).format(d)};
 const metrics=([["18",w().jobs],["30",w().clients],["8",w().quotes],["12",w().invoices]])=>'<div class="sample-metrics">'+metrics.map(([a,b])=>'<div><strong>'+a+'</strong><small>'+b+'</small></div>').join("")+'</div>';
 const list=(rows)=>rows.join("")+'</section>';
 const originals=screens.slice();
 screens[0]=()=>metrics() + title(w().jobList,6)+list(jobs.slice(0,6).map(j=>line(j.name,service(j.service)+' · '+date(j.day)+' · '+j.time,j.status)))+'<div class="sample-insights"><span>4 '+w().team+'</span><span>6 '+w().requests+'</span><span>20 '+w().jobs+'</span></div>';
 screens[1]=()=>'<section class="populated"><h3>'+w().calendar+'</h3><div class="sample-calendar">'+Array.from({length:10},(_,i)=>'<div><strong>'+date(i)+'</strong>'+jobs.filter(j=>j.day===i).slice(0,3).map((j,k)=>'<small class="sample-calendar-job '+(k%2?"alt":"")+'">'+j.time+' · '+j.name.split(" ")[0]+'<br>'+service(j.service)+'</small>').join("")+'</div>').join("")+'</div></section>'+title(w().jobList,10)+list(jobs.slice(0,10).map(j=>line(j.name,service(j.service)+' · '+j.time,j.status)));
 screens[2]=()=>title(w().jobList,20)+list(jobs.map(j=>line(j.name,date(j.day)+' · '+service(j.service)+' · '+j.crew,j.status)));
 screens[3]=()=>title(w().people,30)+list(clients.map(c=>line(c.name,c.id+' · '+c.area+' · '+c.frequency,"Scheduled")));
 screens[4]=()=>title(w().queue,8)+list(quotes.map(q=>line(q.name,q.id+' · '+service(q.service)+' · $'+q.amount,q.status)));
 screens[5]=()=>title(w().billed,12)+list(invoices.map(x=>line(x.name,x.id+' · $'+x.amount+' · '+x.method,x.status)));
 copy.en.nav.push("Pricing","Team","Routes","Requests");copy.es.nav.push("Precios","Equipo","Rutas","Solicitudes");
 copy.en.head.push("Pricing calculator","Team and time","Routes and mileage","Incoming requests");
 copy.es.head.push("Calculadora de precios","Equipo y tiempo","Rutas y millaje","Solicitudes recibidas");
 copy.en.subtitle.push("An estimate based on example prices.","A clear view of your crew.","See the next stops without digging through texts.","Every inquiry in one place.");
 copy.es.subtitle.push("Un estimado con precios de ejemplo.","Organiza a tu equipo.","Próximas paradas a la vista.","Todas las solicitudes en un solo lugar.");
 icons.push("＄","♧","↗","✉");Object.assign(actions,{pricing:6,team:7,routes:8,requests:9});
 screens.push(()=>metrics([["$160","2BR / 2BA · Standard"],["$35","Fridge + oven"],["-10%","Biweekly"],["$176","Sample estimate"]])+'<div class="tile"><h3>'+w().pricing+'</h3><p>1,450 sq ft · 2 BR / 2 BA · Biweekly</p><div class="data-row"><strong>Inside fridge · $20</strong></div><div class="data-row"><strong>Inside oven · $15</strong></div><div class="data-row"><strong>Frequency discount · -10%</strong></div><div class="data-row"><strong>Illustrative estimated total · $176</strong></div></div>');
 screens.push(()=>metrics([["4",w().team],["3","Assigned today"],["23h 45m","Time entries"],["42mi","Mileage"]])+title(w().members,4)+list(crew.map((n,i)=>line(n,["8:00–12:30 · Deep cleaning","9:30–1:30 · Recurring","10:00–2:00 · Move-out","1:00–4:15 · Condo"][i],i===3?"Scheduled":"In progress")));
 screens.push(()=>metrics([["3","Upcoming stops"],["42mi","Sample mileage"],["4",w().team],["6","Service areas"]])+title(w().stops,3)+list(jobs.slice(0,3).map((j,i)=>line(j.name,"Stop "+(i+1)+" · "+areas[i]+" · "+j.time,j.status))));
 screens.push(()=>metrics([["6",w().requests],["2","New"],["1","Booked"],["1","Follow-up"]])+title(w().inbox,6)+list(requests.map(q=>line(q.name,service(q.service)+' · '+areas[clients.findIndex(c=>c.name===q.name)%6],q.status))));
 document.body.classList.toggle("demo-embedded",params.get("embedded")==="1");
 const requestedTab=Number(params.get("tab")||0);if(Number.isInteger(requestedTab)&&requestedTab>=0&&requestedTab<screens.length)state.tab=requestedTab;
 render();
 const sampleNotice=document.createElement("div");sampleNotice.className="populated-disclaimer";sampleNotice.setAttribute("role","note");sampleNotice.textContent=w().note;
 document.querySelector("#app")?.appendChild(sampleNotice);
 document.getElementById("nav")?.addEventListener("click",()=>{setTimeout(()=>{if(!document.querySelector(".populated-disclaimer"))document.querySelector("#app")?.appendChild(sampleNotice);sampleNotice.textContent=w().note},0)});
})();
