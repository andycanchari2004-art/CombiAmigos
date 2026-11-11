/* Capa de almacenamiento (demo con localStorage). Para producción, reemplazar por llamadas a una API.
   AVISO: localStorage NO es seguro para información sensible. */
const Storage={
  get(k,d=null){try{const v=localStorage.getItem('ca_'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){localStorage.setItem('ca_'+k,JSON.stringify(v))},
  update(k,fn,d=null){const v=fn(this.get(k,d));this.set(k,v);return v},
  remove(k){localStorage.removeItem('ca_'+k)}
};
