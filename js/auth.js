/* Sesión y control de acceso por rol */
const Auth={
  user(){return Storage.get('sesion')},
  login(email,pass){
    if(!/^\S+@\S+\.\S+$/.test(email))return{ok:false,msg:'Correo electrónico inválido.'};
    if(pass.length<6)return{ok:false,msg:'La contraseña debe tener al menos 6 caracteres.'};
    const u=Usuarios.list().find(x=>x.email===email.trim().toLowerCase()&&x.password===pass);
    if(!u)return{ok:false,msg:'Credenciales incorrectas.'};
    Storage.set('sesion',u);return{ok:true,u};
  },
  logout(){Storage.remove('sesion');location.href='login.html'},
  home(u){return u.rol==='padre'?'dashboard-padre.html':'dashboard-conductor.html'},
  guard(){
    const u=this.user();if(!u){location.href='login.html';return null}
    const need=document.body.dataset.role;
    if(need&&need!=='any'&&need!==u.rol){location.href=this.home(u);return null}
    return u;
  },
  initLogin(){
    const f=document.getElementById('loginForm');if(!f)return;
    const m=document.getElementById('msg');
    document.getElementById('togglePw').onclick=()=>{const p=document.getElementById('pass');p.type=p.type==='password'?'text':'password'};
    f.onsubmit=e=>{e.preventDefault();
      const r=this.login(document.getElementById('email').value,document.getElementById('pass').value);
      m.className='msg '+(r.ok?'good':'err');m.textContent=r.ok?'Bienvenido/a, '+r.u.nombre:r.msg;
      if(r.ok)setTimeout(()=>location.href=this.home(r.u),600)};
  }
};
