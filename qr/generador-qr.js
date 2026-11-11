/* Requiere qrcodejs (CDN). El código tiene formato COMBI|<idEstudiante> */
const QRGen={render(el,idEst){el.innerHTML='';if(typeof QRCode==='undefined')return el.textContent='Biblioteca QR no cargada (¿sin internet?).';
  new QRCode(el,{text:'COMBI|'+idEst,width:160,height:160})}};
