/* TLE: guided appointment duration. Keeps existing Supabase field names. */
(function(){
'use strict';
const bands=[
[60,'30–60 minutes','30–60 minutos'],[120,'1–2 hours','1–2 horas'],
[180,'2–3 hours','2–3 horas'],[240,'3–4 hours','3–4 horas'],
[300,'4–5 hours','4–5 horas'],[360,'5–6 hours','5–6 horas'],
[480,'6–8 hours','6–8 horas'],[720,'8–12 hours','8–12 horas']
];
const style=document.createElement('style');
style.textContent='.tle-duration{background:#F4F9FC;border:1px solid #C5DCEA;border-radius:16px;padding:17px;min-width:0}.tle-duration [hidden]{display:none!important}.tle-duration .dt-title{font-size:15px;font-weight:800;color:#191919;display:block;margin:0 0 6px}.tle-duration .dt-note{font-size:13px;line-height:1.5;color:#506572;margin:6px 0 13px}.tle-duration .dt-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tle-duration .dt-radio{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #BCD6E6;border-radius:12px;padding:13px;font-size:14px;font-weight:700;margin:0;cursor:pointer}.tle-duration .dt-radio:has(input:checked){background:#E7F3FB;border-color:#4E88B0}.tle-duration .dt-radio input{appearance:auto;width:20px;height:20px;margin:0;flex:0 0 20px;accent-color:#191919;padding:0}.tle-duration .dt-panel{background:#fff;border-radius:12px;border:1px solid #D1E1EB;padding:14px;margin-top:12px;min-width:0}.tle-duration .dt-panel label,.tle-duration .dt-row label{font-size:13px;font-weight:700;color:#191919;display:block;margin-bottom:7px}.tle-duration select,.tle-duration .dt-row input{display:block;width:100%;min-width:0;min-height:48px;border-radius:10px;border:1px solid #B8CBDA;background:#fff;padding:10px 12px;font-size:16px;color:#191919}.tle-duration .dt-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:9px;padding:12px 0;border-bottom:1px solid #E4EBF0;align-items:end}.tle-duration .dt-row:last-child{border:0}.tle-duration button{min-height:44px;font-size:13px;font-weight:750;border-radius:10px;cursor:pointer;padding:10px 12px}.tle-duration .dt-add{margin-top:12px;background:#EAF4FC;border:1px solid #A6C8DF;color:#191919}.tle-duration .dt-remove{background:#fff;border:1px solid #C7D6E0;color:#191919}.tle-duration .dt-error{color:#9C3030;font-size:13px;font-weight:700;margin:10px 0}.tle-duration :is(input,select,button):focus-visible{outline:3px solid #80B2D6;outline-offset:2px}@media(max-width:650px){.tle-duration{padding:13px}.tle-duration .dt-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.tle-duration .dt-remove{grid-column:1/-1;justify-self:start}}@media(max-width:350px){.tle-duration .dt-choices,.tle-duration .dt-row{grid-template-columns:1fr}}';
document.head.append(style);
function mount(config){
  const form=config.form,es=!!config.es,t=(a,b)=>es?b:a;
  const host=form.querySelector('[data-tle-duration-picker]');
  const minutes=form.querySelector('[name=job_duration_minutes]');
  const rules=form.querySelector('[name=service_duration_rules]');
  if(!host||!minutes||!rules)return null;
  const options=()=>'<option value="">'+t('Choose a time range','Elige un rango de tiempo')+'</option>'+bands.map(b=>'<option value="'+b[0]+'">'+b[es?2:1]+'</option>').join('');
  host.className='tle-duration';
  host.innerHTML=[
    '<span class="dt-title" id="durationTitle">'+t('Do all your services take about the same time? *','¿Todos tus servicios duran aproximadamente lo mismo? *')+'</span>',
    '<p class="dt-note">'+t('Choose what fits your business. We will review times before activating your calendar.','Elige lo que mejor describa tu negocio. Revisaremos los tiempos antes de activar tu calendario.')+'</p>',
    '<div class="dt-choices" role="radiogroup" aria-labelledby="durationTitle">',
      '<label class="dt-radio"><input type="radio" name="duration_mode" value="same"><span>'+t('Yes, usually','Sí, generalmente')+'</span></label>',
      '<label class="dt-radio"><input type="radio" name="duration_mode" value="varies"><span>'+t('No, it depends on the service','No, depende del servicio')+'</span></label>',
    '</div>',
    '<div class="dt-panel" data-duration-same hidden><label for="durationOne">'+t('Typical appointment duration *','Duración habitual de una cita *')+'</label><select id="durationOne">'+options()+'</select>',
    '<p class="dt-note">'+t('We use the upper end of your range for planning. Exact times are confirmed before launch.','Usamos el límite superior del rango para planificar. Los tiempos se confirman antes del lanzamiento.')+'</p></div>',
    '<div class="dt-panel" data-duration-varies hidden><p class="dt-note">'+t('Add each main service and its estimated time (up to 10).','Agrega cada servicio principal y su tiempo estimado (hasta 10).')+'</p>',
    '<div data-duration-rows></div><button class="dt-add" type="button" data-duration-add>'+t('+ Add service','+ Agregar servicio')+'</button>',
    '<p class="dt-note">'+t('These are planning estimates, not confirmed available appointments.','Estos son tiempos estimados, no citas disponibles confirmadas.')+'</p></div>',
    '<p class="dt-error" role="alert" data-duration-error hidden></p>'
  ].join('');
  const same=host.querySelector('[data-duration-same]'),
    varied=host.querySelector('[data-duration-varies]'),
    single=host.querySelector('#durationOne'),rows=host.querySelector('[data-duration-rows]'),
    add=host.querySelector('[data-duration-add]'),err=host.querySelector('[data-duration-error]'),
    radios=[...host.querySelectorAll('input[name=duration_mode]')];
  let count=0;
  const mode=()=>radios.find(r=>r.checked)?.value||'';
  function error(message,focus){
    err.textContent=message;err.hidden=false;host.scrollIntoView({block:'center'});
    if(focus)focus.focus({preventScroll:true});
    return false;
  }
  function addRow(){
    if(rows.children.length>=10)return;
    const id=++count,row=document.createElement('div');row.className='dt-row';
    const left=document.createElement('div'),right=document.createElement('div'),
      name=document.createElement('input'),range=document.createElement('select');
    const nameLabel=document.createElement('label'),rangeLabel=document.createElement('label');
    name.id='durationService'+id;name.type='text';name.maxLength=80;
    name.placeholder=t('e.g. Deep cleaning','Ej.: limpieza profunda');name.className='dt-service';
    nameLabel.htmlFor=name.id;nameLabel.textContent=t('Service name *','Nombre del servicio *');
    range.id='durationRange'+id;range.innerHTML=options();range.className='dt-range';
    rangeLabel.htmlFor=range.id;rangeLabel.textContent=t('Usual duration *','Duración habitual *');
    left.append(nameLabel,name);right.append(rangeLabel,range);
    const remove=document.createElement('button');remove.type='button';remove.className='dt-remove';
    remove.textContent=t('Remove','Quitar');remove.setAttribute('aria-label',t('Remove service','Quitar servicio')+' '+id);
    remove.addEventListener('click',()=>{row.remove();if(!rows.children.length)addRow();add.hidden=rows.children.length>=10;err.hidden=true});
    row.append(left,right,remove);rows.append(row);add.hidden=rows.children.length>=10;
    return name;
  }
  add.addEventListener('click',()=>{const input=addRow();if(input)input.focus()});
  function update(){
    const v=mode();same.hidden=v!=='same';varied.hidden=v!=='varies';
    single.disabled=v!=='same';
    if(v==='varies'&&!rows.children.length)addRow();
    rows.querySelectorAll('input,select,button').forEach(el=>{el.disabled=v!=='varies'});
    err.hidden=true;
  }
  radios.forEach(el=>el.addEventListener('change',update));update();
  function validate(){
    if(!mode())return error(t('Choose an option first.','Elige una opción para continuar.'),radios[0]);
    if(mode()==='same')return single.value?(err.hidden=true,true):error(t('Choose your typical duration.','Elige la duración habitual.'),single);
    const items=[...rows.querySelectorAll('.dt-row')];
    if(!items.length)return error(t('Add a service.','Agrega un servicio.'),add);
    for(const row of items){
      const name=row.querySelector('input'),range=row.querySelector('select');
      if(!name.value.trim())return error(t('Enter a service name.','Escribe el nombre del servicio.'),name);
      if(!range.value)return error(t('Choose a duration for each service.','Elige un tiempo para cada servicio.'),range);
    }
    err.hidden=true;return true;
  }
  function apply(){
    if(!validate())return false;
    if(mode()==='same'){minutes.value=single.value;rules.value='';return true}
    const all=[...rows.querySelectorAll('.dt-row')].map(row=>{
      const name=row.querySelector('input').value.trim().replace(/[\n\r;]+/g,' ').slice(0,80);
      const n=Number(row.querySelector('select').value),b=bands.find(a=>a[0]===n);
      return{name,n,label:b?b[es?2:1]:''};
    });
    minutes.value=String(Math.max(...all.map(a=>a.n)));
    rules.value=all.map(a=>a.name+': '+a.label+' (up to '+a.n+' min)').join('\n');
    return true;
  }
  return{validate,apply};
}
window.TLEDurationPicker={mount};
})();