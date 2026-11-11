/* Viaje en tiempo real: mapa real (OSM + rutas OSRM), combi que se mueve, notificaciones. Roles: padre (mira) / conductor (maneja) */
const Viaje={s:null,map:null,van:null,line:null,pins:[],path:[],cum:[],stopAt:[],dur:0,u:null,route:0,timer:null,gps:null,modo:null,d:0,pausa:0,lastN:-1,lastGeo:0,
  local:0,
  post(tipo,x){const a={tipo,...x};
    if(this.local){this.s=Estado.accion(this.s,a);localStorage.setItem('ca_viaje',JSON.stringify(this.s));this.update();return Promise.resolve()}
    return fetch('/api/accion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(a)}).catch(()=>App.toast('Sin conexión con el servidor','err'))},
  /* Sin servidor: el viaje se comparte entre pestañas/ventanas del MISMO navegador */
  modoLocal(){if(this.local)return;this.local=1;
    this.s=JSON.parse(localStorage.getItem('ca_viaje')||'null')||Estado.base();localStorage.setItem('ca_viaje',JSON.stringify(this.s));
    window.addEventListener('storage',e=>{if(e.key==='ca_viaje'&&e.newValue){this.s=JSON.parse(e.newValue);this.update()}});
    this.update();App.toast('Modo local: abre padre y conductor en dos pestañas del mismo navegador.')},
  init(u){this.u=u;
    this.map=L.map('map',{zoomControl:false}).setView([-13.41,-76.132],14);L.control.zoom({position:'topright'}).addTo(this.map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri',maxZoom:19}).addTo(this.map);
   
    // Pide la ubicación y la muestra en el mapa
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(
    p=>{
      const ll=[p.coords.latitude,p.coords.longitude];
      this.map.setView(ll,16);
      L.marker(ll).addTo(this.map).bindPopup('Estás aquí').openPopup();
    },
    ()=>alert('Activa la ubicación del navegador para ver tu posición real.'),
    {enableHighAccuracy:true,timeout:10000}
  );
}else{
  alert('Tu navegador no permite ubicación.');
}
    let ok=0;const es=new EventSource('/api/stream');es.onmessage=e=>{ok=1;this.s=JSON.parse(e.data);this.update()};
    es.onerror=()=>{if(!ok){es.close();this.modoLocal()}};
    setInterval(()=>{const c=document.getElementById('clock');if(c)c.textContent=new Date().toLocaleTimeString('es-PE',{timeZone:'America/Lima'})},1000)},
  
    async buildRoute(){
    this.route=1;const P=this.s.paradas,pts=P.map(p=>[p.lat,p.lng]);this.path=pts;this.dur=0;
    try{const r=await fetch('https://router.project-osrm.org/route/v1/driving/'+P.map(p=>p.lng+','+p.lat).join(';')+'?overview=full&geometries=geojson');
      const j=await r.json();this.path=j.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);this.dur=j.routes[0].duration}
    catch(e){App.toast('No se pudo calcular la ruta por calles; se muestra una línea recta.','err')}
    this.cum=[0];for(let i=1;i<this.path.length;i++)this.cum.push(this.cum[i-1]+this.map.distance(this.path[i-1],this.path[i]));
    if(!this.dur)this.dur=this.cum[this.cum.length-1]/7;
    let from=0;this.stopAt=P.map((p,k)=>{let b=from,bd=1e9;for(let i=from;i<this.path.length;i++){const d=this.map.distance(this.path[i],[p.lat,p.lng]);if(d<bd){bd=d;b=i}if(k>0&&k<P.length-1&&d>bd+400)break}
      if(k===P.length-1)b=this.path.length-1;from=b;return this.cum[b]});
    this.line=L.polyline(this.path,{color:'#2563eb',weight:5,opacity:.8}).addTo(this.map);this.map.fitBounds(this.line.getBounds(),{padding:[50,50]});this.update()},
  at(d){const c=this.cum;let i=1;while(i<c.length-1&&c[i]<d)i++;const t=(d-c[i-1])/((c[i]-c[i-1])||1),a=this.path[i-1],b=this.path[i];return[a[0]+(b[0]-a[0])*Math.min(Math.max(t,0),1),a[1]+(b[1]-a[1])*Math.min(Math.max(t,0),1)]},
  prog(){if(!this.s.pos||!this.cum.length)return 0;let b=0,bd=1e9;this.path.forEach((p,i)=>{const d=this.map.distance(p,[this.s.pos.lat,this.s.pos.lng]);if(d<bd){bd=d;b=i}});return this.cum[b]/this.cum[this.cum.length-1]},
  update(){const s=this.s;if(!this.route)return this.buildRoute();if(this.route===1&&!this.line)return;
    if(!this.pins.length)s.paradas.forEach((p,i)=>this.pins.push(L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',iconSize:[26,26],html:'<div class="pin" id="pin'+i+'">'+(i===0?'🏫':i===s.paradas.length-1?'🏁':i)+'</div>'})}).bindPopup('<b>'+p.nombre+'</b><br>'+(p.ninos.join('<br>')||'Colegio')).addTo(this.map)));
    s.paradas.forEach((p,i)=>{const e=document.getElementById('pin'+i);if(e)e.className='pin'+(p.llego?' done':i===s.idx&&s.estado==='en_curso'?' next':'')});
    const pos=s.pos||{lat:s.paradas[0].lat,lng:s.paradas[0].lng};
    if(!this.van)this.van=L.marker([pos.lat,pos.lng],{icon:L.divIcon({className:'',iconSize:[40,40],html:'<div class="van">🚐</div>'}),zIndexOffset:900}).addTo(this.map);
    this.van.setLatLng([pos.lat,pos.lng]);if(s.estado==='en_curso'&&this.u.rol==='padre')this.map.panTo([pos.lat,pos.lng],{animate:true});
    if(this.u.rol==='padre'&&this.lastN>=0)s.notifs.slice(0,s.notifs.length-this.lastN).reverse().forEach(n=>{App.toast('🔔 '+n.msg);if(navigator.vibrate)navigator.vibrate(200)});
    this.lastN=s.notifs.length;this.sheet();if(s.estado==='solicitado')this.stop()},
  chips(){const e={solicitado:['Esperando conductor','pend'],aceptado:['Viaje aceptado','pend'],en_curso:['En camino','ok'],finalizado:['Viaje finalizado','ok']}[this.s.estado];return '<span class="badge '+e[1]+'">'+e[0]+'</span>'},
  ninos(){return this.s.paradas.map((p,i)=>p.ninos.length?'<div class="stop"><b>'+(p.llego?'✅ ':'📍 ')+p.nombre+'</b>'+p.ninos.map(n=>'<span>'+n+'</span>').join('')+'</div>':'').join('')},
  sheet(){const s=this.s,P=s.paradas,nx=P[s.idx],el=document.getElementById('sheet'),pad=this.u.rol==='padre';let h='<div class="grab"></div><div class="row">'+this.chips()+'<span id="clock" class="clock"></span></div>';
    const eta=s.estado==='en_curso'?new Date(Date.now()+this.dur*(1-this.prog())*1000).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',timeZone:'America/Lima'}):'--:--';
    if(s.estado==='en_curso')h+='<h3>Próxima parada: '+nx.nombre+'</h3><p class="mut">Llegada estimada al colegio: <b>'+eta+'</b>'+(s.pos&&s.pos.calle?'<br>📍 Ahora por: '+s.pos.calle:'')+'</p>'+(pad?'<p class="live"><i></i> Vigilado en tiempo real</p>':'');
    else if(s.estado==='finalizado')h+='<h3>Viaje finalizado ✅</h3>';
    else h+='<h3>Ruta escolar · '+P[0].nombre+'</h3><p class="mut">Salida → '+P.slice(1,-1).map(p=>p.nombre).join(' → ')+' → Destino</p>';
    h+=this.ninos();
    if(!pad){const b=(id,t,c)=>'<button class="btn '+(c||'')+' big" onclick="Viaje.act(\''+id+'\')">'+t+'</button>';
      if(s.estado==='solicitado')h+=b('aceptar','Aceptar viaje','green');
      if(s.estado==='aceptado')h+=b('iniciar','▶ Iniciar viaje','green');
      if(s.estado==='en_curso'){h+=b('llegue','Llegué a: '+nx.nombre.slice(0,28));
        h+='<div class="row2"><button class="btn ghost" onclick="Viaje.act(\'sim\')">'+(this.modo==='sim'?'⏸ Simulación activa':'▶ Simular recorrido')+'</button><button class="btn ghost" onclick="Viaje.act(\'gps\')">'+(this.modo==='gps'?'📡 GPS activo':'📡 Usar mi GPS')+'</button></div>'}
      h+='<button class="btn link" onclick="Viaje.act(\'reiniciar\')">Reiniciar demo</button>'}
    else if(s.estado==='finalizado')h+='<p class="mut">Los niños llegaron al colegio.</p>';
    h+='<h4>Notificaciones</h4>'+(s.notifs.map(n=>'<div class="notif"><small>'+n.h+'</small> '+n.msg+'</div>').join('')||'<p class="mut">Sin notificaciones.</p>');el.innerHTML=h},
  act(a){
    if(a==='sim'){this.modo='sim';this.d=this.s.pos?this.cum[this.near()]:0;this.run();return this.sheet()}
    if(a==='gps'){if(!navigator.geolocation)return App.toast('GPS no disponible (se requiere localhost o HTTPS). Usa la simulación.','err');
      this.modo='gps';this.stop();this.gps=navigator.geolocation.watchPosition(p=>this.mover(p.coords.latitude,p.coords.longitude),()=>{App.toast('No se pudo usar el GPS. Usa la simulación.','err');this.modo=null},{enableHighAccuracy:true});return this.sheet()}
    if(a==='reiniciar'){this.stop();this.modo=null;this.d=0}
    if(a==='llegue'&&this.modo==='sim'&&this.s.pos)this.d=this.stopAt[this.s.idx];
    this.post(a)},
  near(){let b=0,bd=1e9;this.path.forEach((p,i)=>{const d=this.map.distance(p,[this.s.pos.lat,this.s.pos.lng]);if(d<bd){bd=d;b=i}});return b},
  run(){this.stop(false);this.timer=setInterval(()=>{const s=this.s;if(s.estado!=='en_curso')return;
    if(this.pausa>0){this.pausa--;return}
    const meta=this.stopAt[s.idx];this.d=Math.min(this.d+70,meta);const p=this.at(this.d);this.mover(p[0],p[1]);
    if(this.d>=meta){this.post('llegue');this.pausa=4}},1000)},
  mover(lat,lng){this.post('pos',{lat,lng});
    this.s.refs.forEach(r=>{if(this.map.distance([lat,lng],[r.lat,r.lng])<150)this.post('ref',{nombre:r.nombre})});
    if(Date.now()-this.lastGeo>12000){this.lastGeo=Date.now();fetch('https://nominatim.openstreetmap.org/reverse?format=json&zoom=17&lat='+lat+'&lon='+lng).then(r=>r.json())
      .then(j=>{const a=j.address||{};this.post('pos',{lat,lng,calle:a.road||a.suburb||''})}).catch(()=>{})}},
  stop(clr=true){if(this.timer){clearInterval(this.timer);this.timer=null}if(clr&&this.gps!=null){navigator.geolocation.clearWatch(this.gps);this.gps=null}}
};
