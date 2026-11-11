/* Mapa Leaflet + OpenStreetMap con checkpoints */
const Mapa={map:null,capa:null,
  render(){
    return; /* el mapa en vivo ahora está en js/viaje.js */
    const cps=Checkpoints.list();
    if(!this.map){this.map=L.map('map');L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(this.map);
      this.map.fitBounds(cps.map(c=>[c.lat,c.lng]),{padding:[40,40]})}
    if(this.capa)this.capa.remove();this.capa=L.layerGroup().addTo(this.map);
    L.polyline(cps.map(c=>[c.lat,c.lng]),{color:'#1d6fd8',dashArray:'8'}).addTo(this.capa);
    cps.forEach(c=>L.marker([c.lat,c.lng],{icon:Marcadores.icono(c)}).bindPopup(Marcadores.popup(c)).addTo(this.capa));
  }};
