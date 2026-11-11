/* Estado de la ruta y paneles de padre / conductor */
const Rutas={
  ESTADOS:['Ruta pendiente','Conductor inició la ruta','En camino al punto de recogida','Estudiante recogido','En camino al colegio','Llegada al colegio confirmada'],
  MSG:{1:'¡Atención! El conductor ha iniciado la ruta escolar. La unidad ya está en camino.',2:'El conductor va en camino al punto de recogida.',3:'Estudiante recogido.',4:'La unidad va en camino al colegio.',5:'Llegada al colegio confirmada. Ruta finalizada.'},
  get(){return Storage.get('ruta')},
  set(i){const r=this.get();if(i<=r.estado)return false;r.estado=i;if(i===1)r.inicio=new Date().toISOString();Storage.set('ruta',r);
    Historial.add(i===1?'Inicio de ruta':i===5?'Llegada al colegio':'Cambio de estado',this.ESTADOS[i]);Notif.add(this.MSG[i]);App.refresh();return true},
  reiniciar(){Storage.set('ruta',{estado:0,inicio:null});Storage.set('checkpoints',DEMO.checkpoints);Historial.add('Cambio de estado','Ruta reiniciada (demo)');App.refresh()},
  eta(){const r=this.get();if(!r.inicio)return'--:--';return new Date(new Date(r.inicio).getTime()+25*60000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})},
  pasos(el){el.innerHTML=this.ESTADOS.map((s,i)=>'<li class="'+(i<this.get().estado?'done':i===this.get().estado?'now':'')+'">'+(i+1)+'. '+s+'</li>').join('')},
  renderPadre(u){
    const e=Usuarios.estudiante(u.estudianteId),r=this.get(),cps=Checkpoints.list(),last=cps.filter(c=>c.confirmado).pop();
    const set=(id,v)=>{const x=document.getElementById(id);if(x)x.textContent=v};
    set('est',e.nombre);set('cond',Usuarios.conductor().nombre);set('estado',this.ESTADOS[r.estado]);set('eta',this.eta());
    set('recogida',cps[0].nombre);set('destino',cps[cps.length-1].nombre);set('ultima',last?last.nombre+' ('+new Date(last.hora).toLocaleTimeString()+')':'Ninguna aún');
    this.pasos(document.getElementById('steps'));Notif.render(document.getElementById('notifs'));
  },
  renderConductor(){
    const r=this.get();this.pasos(document.getElementById('steps'));
    document.getElementById('btnIniciar').disabled=r.estado!==0;
    document.getElementById('btnRecogida').disabled=r.estado!==1;
    document.getElementById('btnColegio').disabled=r.estado!==3;
    document.getElementById('cpList').innerHTML=Checkpoints.list().map(c=>'<div class="cpbtn"><div><b>'+c.nombre+'</b><br><small>'+c.tipo+(c.confirmado?' · '+c.modo:'')+'</small></div>'+
      (c.confirmado?'<span class="badge ok">Confirmado</span>':'<button class="btn" onclick="Checkpoints.confirmar(\''+c.id+'\')">Confirmar llegada</button>')+'</div>').join('');
  },
  initConductor(){const b=id=>document.getElementById(id);if(!b('btnIniciar'))return;
    b('btnIniciar').onclick=()=>this.set(1);b('btnRecogida').onclick=()=>this.set(2);b('btnColegio').onclick=()=>this.set(4);
    b('btnReset').onclick=()=>{if(confirm('¿Reiniciar la ruta de demostración?'))this.reiniciar()}}
};
