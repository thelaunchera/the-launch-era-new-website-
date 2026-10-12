/* Reload the installed or browser workspace without touching auth or other apps. */
(()=>{
 const button=document.getElementById('workspaceRefresh');if(!button)return;
 const originals=new Map();
 const value=field=>field.type==='checkbox'||field.type==='radio'?String(field.checked):field.value;
 const tracked=field=>field?.matches?.('input,textarea,select')&&field.closest('#app')&&!/search|filter|language/i.test(field.id||'')&&!['search','hidden','button','submit'].includes(field.type)&&!field.closest('.filters,.toolbar,#crmLanguagePicker');
 document.addEventListener('focusin',event=>{const field=event.target;if(tracked(field)&&!originals.has(field))originals.set(field,value(field));});
 // Called only after a confirmed save in the corresponding editor.
 window.TLECommandCenterRefresh={markSaved(scope){const root=typeof scope==='string'?document.getElementById(scope):scope;if(!root)return;for(const field of originals.keys())if(root.contains(field))originals.set(field,value(field));}};
 button.addEventListener('click',()=>{
  const dirty=[...originals].some(([field,before])=>field.isConnected&&value(field)!==before);
  const es=localStorage.getItem('tle_crm_language')==='es';
  if(dirty&&!window.confirm(es?'Tienes cambios sin guardar. Guárdalos antes de actualizar. ¿Actualizar de todos modos?':'You have unsaved changes. Save them before refreshing. Refresh anyway?'))return;
  button.disabled=true;button.setAttribute('aria-busy','true');button.textContent=es?'Actualizando…':'Refreshing…';
  // No logout, storage clearing or version tokens: private access and installed URLs remain intact.
  window.location.reload();
 });
})();
