/* Confirmación de checkpoints: usa geolocalización puntual (sin rastreo continuo); si no hay, confirmación MANUAL */
const Checkpoints={
  RADIO:150,
  list(){return Storage.get('checkpoints',[])},
  confirmar(id){
    if(Rutas.get().estado<1)return App.toast('Primero inicia la ruta.','err');
    const c=this.list().find(x=>x.id===id);if(c.confirmado)return App.toast('Ya fue confirmado.','err');
    const manual=msg=>{if(confirm(msg+'\n\n¿Confirmar MANUALMENTE? Quedará registrado como confirmación manual.'))this.ok(id,'Manual')};
    if(!navigator.geolocation)return manual('Geolocalización no disponible.');
    navigator.geolocation.getCurrentPosition(p=>{
      const d=Ubicaciones.distancia(p.coords.latitude,p.coords.longitude,c.lat,c.lng);
      d<=this.RADIO?this.ok(id,'GPS'):manual('Estás a '+Math.round(d)+' m del checkpoint (máx. '+this.RADIO+' m).');
    },()=>manual('No se pudo obtener tu ubicación (permiso denegado o sin señal).'),{timeout:8000});
  },
  ok(id,modo){
    const l=this.list(),c=l.find(x=>x.id===id);c.confirmado=true;c.hora=new Date().toISOString();c.modo=modo;Storage.set('checkpoints',l);
    Historial.add('Checkpoint',c.nombre+' confirmado ('+modo+')');
    if(id==='cp1'){Notif.add('El conductor llegó al punto de recogida.');Rutas.set(3)}
    else if(id==='cp3'){Notif.add('Llegada al colegio confirmada.');Rutas.set(5);Notif.add('Ruta finalizada.')}
    else Notif.add('Checkpoint alcanzado: '+c.nombre+'.');
    App.toast('Checkpoint confirmado ('+modo+').','good');App.refresh();
  }
};
