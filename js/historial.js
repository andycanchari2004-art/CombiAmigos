const Historial={list(){return Storage.get('historial',[])},
  add(tipo,detalle){const l=this.list();l.push({tipo,detalle,fecha:new Date().toISOString(),usuario:(Auth.user()||{}).nombre||'Sistema'});Storage.set('historial',l)},
  render(){
    const tb=document.getElementById('histBody');if(!tb)return;
    const ft=document.getElementById('fTipo').value,fd=document.getElementById('fFecha').value;
    const rows=this.list().filter(h=>(!ft||h.tipo===ft)&&(!fd||h.fecha.slice(0,10)===fd)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    tb.innerHTML=rows.map(h=>'<tr><td>'+new Date(h.fecha).toLocaleString()+'</td><td>'+h.tipo+'</td><td>'+h.detalle+'</td><td>'+h.usuario+'</td></tr>').join('')||'<tr><td colspan="4">Sin registros.</td></tr>';
  },
  init(){const s=document.getElementById('fTipo');if(!s)return;
    s.innerHTML='<option value="">Todos</option>'+[...new Set(['Inicio de ruta','Cambio de estado','Checkpoint','Llegada al colegio','Pago registrado',...this.list().map(h=>h.tipo)])].map(t=>'<option>'+t+'</option>').join('');
    s.onchange=document.getElementById('fFecha').onchange=()=>this.render();}};
