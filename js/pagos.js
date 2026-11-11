/* Pagos locales. Un pago solo es PAGADO si el conductor confirma que recibió el dinero. */
const Pagos={
  MESES:['Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  list(){return Storage.get('pagos',[])},
  add(d,u){
    if(!d.estudianteId||!d.mes||!(d.monto>0))return{ok:false,msg:'Completa estudiante, mes y un monto mayor a 0.'};
    if(this.list().some(p=>p.estudianteId===d.estudianteId&&p.mes===d.mes))return{ok:false,msg:'Ya existe un pago para ese estudiante y mes.'};
    const l=this.list(),p={id:l.length+1,...d,monto:+d.monto,fecha:new Date().toISOString(),estado:(u.rol==='conductor'&&d.recibido)?'PAGADO':'PENDIENTE'};
    l.push(p);Storage.set('pagos',l);Historial.add('Pago registrado',p.mes+' · S/ '+p.monto.toFixed(2)+' · '+p.estado);
    return{ok:true,msg:'Pago registrado como '+p.estado+'.'}},
  confirmar(id){const l=this.list();l.find(p=>p.id===id).estado='PAGADO';Storage.set('pagos',l);Historial.add('Pago registrado','Pago #'+id+' confirmado como recibido');App.refresh()},
  render(u){
    const tb=document.getElementById('pagoBody');if(!tb)return;
    const ids=Usuarios.visibles(u).map(e=>e.id);
    tb.innerHTML=this.list().filter(p=>ids.includes(p.estudianteId)).map(p=>'<tr><td>'+p.id+'</td><td>'+Usuarios.estudiante(p.estudianteId).nombre+'</td><td>'+p.mes+'</td><td>S/ '+p.monto.toFixed(2)+'</td><td>'+p.metodo+'</td><td>'+new Date(p.fecha).toLocaleDateString()+'</td><td><span class="badge '+(p.estado==='PAGADO'?'ok':'pend')+'">'+p.estado+'</span>'+
      (u.rol==='conductor'&&p.estado==='PENDIENTE'?' <button class="btn ghost" onclick="Pagos.confirmar('+p.id+')">Confirmar recibido</button>':'')+'</td></tr>').join('')||'<tr><td colspan="7">Sin pagos.</td></tr>';
  },
  init(u){
    const f=document.getElementById('pagoForm');if(!f||f.dataset.ok)return;f.dataset.ok=1;
    document.getElementById('pEst').innerHTML=Usuarios.visibles(u).map(e=>'<option value="'+e.id+'">'+e.nombre+'</option>').join('');
    document.getElementById('pMes').innerHTML=this.MESES.map(m=>'<option>'+m+'</option>').join('');
    if(u.rol!=='conductor')document.getElementById('recibWrap').style.display='none';
    f.onsubmit=e=>{e.preventDefault();const g=id=>document.getElementById(id);
      const r=this.add({estudianteId:g('pEst').value,mes:g('pMes').value,monto:g('pMonto').value,metodo:g('pMetodo').value,obs:g('pObs').value,recibido:g('pRecib').checked},u);
      App.toast(r.msg,r.ok?'good':'err');if(r.ok){f.reset();App.refresh()}};
  }
};
