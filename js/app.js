/* Arranque común: sesión, menú, toasts y refresco automático */
const App={u:null,
  toast(m,t=''){let c=document.getElementById('toast');if(!c){c=document.createElement('div');c.id='toast';document.body.appendChild(c)}
    const d=document.createElement('div');d.className='t '+t;d.textContent=m;c.appendChild(d);setTimeout(()=>d.remove(),3500)},
  nav(){const p=document.body.dataset.page,u=this.u,items=[[Auth.home(u),'🏠 Mi panel','panel'],['pagos.html','💳 Pagos','pagos'],['historial.html','🕒 Historial','historial']];
    document.getElementById('side').innerHTML='<div class="brand">🚐 Combi<span>Amigo</span></div>'+items.map(i=>'<a class="'+(p===i[2]?'on':'')+'" href="'+i[0]+'">'+i[1]+'</a>').join('')+'<a href="#" id="out">🚪 Salir</a>';
    document.getElementById('out').onclick=e=>{e.preventDefault();Auth.logout()};
    document.getElementById('who').textContent=u.nombre+' · '+(u.rol==='padre'?'Padre/Madre':'Conductor')},
  refresh(){if(!this.u)return;const p=document.body.dataset.page;
    
    Mapa.render();Pagos.render(this.u);Historial.render()},
  init(){seedDemo();if(document.getElementById('loginForm'))return Auth.initLogin();
    this.u=Auth.guard();if(!this.u)return;this.nav();Rutas.initConductor();Pagos.init(this.u);QRLector.init(this.u);Historial.init();if(document.getElementById('map'))Viaje.init(this.u);this.refresh();
    window.addEventListener('storage',()=>this.refresh())} /* actualiza entre pestañas (padre ve lo que hace el conductor) */
};
document.addEventListener('DOMContentLoaded',()=>App.init());
