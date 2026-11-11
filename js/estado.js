/* Lógica del viaje, compartida: la usa server.js (varias PC) y el navegador (modo local, sin servidor) */
(function(root){
/* >>> COORDENADAS APROXIMADAS de Chincha Alta: ajústalas (Google Maps: clic derecho > copiar coordenadas) <<< */
const base=()=>({estado:'solicitado',idx:0,pos:null,notifs:[],vistas:[],inicio:null,
  paradas:[
   {nombre:'Colegio San Vicente de Paúl (Mauturua)',tipo:'origen',lat:-13.4132,lng:-76.1375,ninos:[],llego:false},
   {nombre:'Posta San Isidro',tipo:'recogida',lat:-13.4205,lng:-76.1440,ninos:['Henry Canchari Choque','Valeria Quispe Huamán'],llego:false},
   {nombre:'Parque de la Av. Benavides',tipo:'recogida',lat:-13.4060,lng:-76.1290,ninos:['Mateo Ccallo Flores','Sofía Huamán Ramos','Diego Paredes Soto'],llego:false},
   {nombre:'Colegio San Vicente de Paúl (Mauturua)',tipo:'destino',lat:-13.4132,lng:-76.1375,ninos:[],llego:false}],
  refs:[{nombre:'la Plaza de Armas de Chincha',lat:-13.4097,lng:-76.1322}]});
const hora=()=>new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',timeZone:'America/Lima'});
function accion(S,a){
  const nota=m=>S.notifs.unshift({t:Date.now(),h:hora(),msg:m});
  const prox=()=>{const p=S.paradas[S.idx];return p.tipo==='destino'?'Próxima parada: '+p.nombre+' (destino final).':'Próxima parada: '+p.nombre+' — recoger a '+p.ninos.join(', ')+'.'};
  if(a.tipo==='aceptar'&&S.estado==='solicitado'){S.estado='aceptado';nota('El conductor aceptó el viaje escolar.')}
  else if(a.tipo==='iniciar'&&S.estado==='aceptado'){S.estado='en_curso';S.idx=1;S.inicio=Date.now();S.paradas[0].llego=true;nota('¡Atención! El conductor inició la ruta. La combi ya está en camino.');nota(prox())}
  else if(a.tipo==='pos'&&S.estado==='en_curso'){S.pos={lat:a.lat,lng:a.lng,t:Date.now(),calle:a.calle||(S.pos&&S.pos.calle)||''}}
  else if(a.tipo==='ref'&&S.estado==='en_curso'&&!S.vistas.includes(a.nombre)){S.vistas.push(a.nombre);nota('La combi está pasando por '+a.nombre+'.')}
  else if(a.tipo==='llegue'&&S.estado==='en_curso'){const p=S.paradas[S.idx];p.llego=true;
    if(p.tipo==='destino'){S.estado='finalizado';nota('Llegada al colegio confirmada. Ruta finalizada. Niños: '+S.paradas.flatMap(x=>x.ninos).join(', ')+'.')}
    else{nota('La combi llegó a '+p.nombre+'. Recogidos: '+p.ninos.join(', ')+'.');S.idx++;nota(prox())}}
  else if(a.tipo==='reiniciar'){S=base()}
  return S}
if(typeof module!=='undefined')module.exports={base,accion};else root.Estado={base,accion};
})(this);
