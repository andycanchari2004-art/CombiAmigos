/* Notificaciones DENTRO de la app (no se envían SMS ni WhatsApp: requeriría un servicio externo) */
const Notif={list(){return Storage.get('notifs',[])},
  add(msg){const l=this.list();l.unshift({msg,fecha:new Date().toISOString()});Storage.set('notifs',l.slice(0,50))},
  render(el){if(!el)return;el.innerHTML=this.list().map(n=>'<div class="notif">'+n.msg+'<small>'+new Date(n.fecha).toLocaleString()+'</small></div>').join('')||'<p>Sin notificaciones.</p>'}};
