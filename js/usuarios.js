const Usuarios={list(){return Storage.get('usuarios',[])},
  estudiantes(){return Storage.get('estudiantes',[])},
  estudiante(id){return this.estudiantes().find(e=>e.id===id)},
  visibles(u){return u.rol==='padre'?this.estudiantes().filter(e=>e.id===u.estudianteId):this.estudiantes()},
  conductor(){return this.list().find(x=>x.rol==='conductor')}};
