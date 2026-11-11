/* Requiere html5-qrcode (CDN). Si no hay cámara, usar el código de prueba */
const QRLector={scanner:null,
  validar(txt){const o=document.getElementById('qrResult');const m=/^COMBI\|(.+)$/.exec(txt.trim());const e=m&&Usuarios.estudiante(m[1]);
    o.innerHTML=e?'<div class="notif">✅ <b>'+e.nombre+'</b><br>'+e.grado+' · Código '+e.id+'</div>':'<div class="notif">❌ Código no válido.</div>';
    if(e)Historial.add('Checkpoint','QR validado: '+e.nombre)},
  init(u){const g=id=>document.getElementById(id);if(!g('qrGen')||g('qrGen').dataset.ok)return;g('qrGen').dataset.ok=1;
    g('qrEst').innerHTML=Usuarios.visibles(u).map(e=>'<option value="'+e.id+'">'+e.nombre+' ('+e.id+')</option>').join('');
    g('qrGen').onclick=()=>QRGen.render(g('qrOut'),g('qrEst').value);
    g('qrDemo').value='COMBI|EST-001';g('qrValidar').onclick=()=>this.validar(g('qrDemo').value);
    g('qrScan').onclick=async()=>{
      if(typeof Html5Qrcode==='undefined'||!navigator.mediaDevices)return App.toast('Cámara no disponible: usa el código de prueba.','err');
      try{this.scanner=this.scanner||new Html5Qrcode('qrReader');await this.scanner.start({facingMode:'environment'},{fps:10,qrbox:200},t=>{this.validar(t);this.scanner.stop();this.scanner=null})}
      catch(e){App.toast('No se pudo abrir la cámara: usa el código de prueba.','err')}}}};
