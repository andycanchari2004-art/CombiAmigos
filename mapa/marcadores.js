const Marcadores={icono(c){return L.divIcon({className:'',html:'<div class="pin" style="background:'+(c.confirmado?'#16a34a':'#1d6fd8')+'"></div>',iconSize:[22,22],iconAnchor:[11,11]})},
  popup(c){const u=Auth.user();return '<b>'+c.nombre+'</b><br>'+c.tipo+' · '+c.info+'<br>Estado: '+(c.confirmado?'Confirmado ('+c.modo+')':'Pendiente')+
    (u.rol==='conductor'&&!c.confirmado?'<br><button class="btn" onclick="Checkpoints.confirmar(\''+c.id+'\')">Confirmar llegada</button>':'')}};
