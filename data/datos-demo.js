/* Datos de demostración (cuentas de prueba) */
const cp=(id,nombre,tipo,lat,lng,info)=>({id,nombre,tipo,lat,lng,info,confirmado:false,hora:null,modo:null});
const DEMO={
  usuarios:[
    {id:1,rol:'padre',nombre:'María Torres',email:'padre@combiamigo.pe',password:'padre123',estudianteId:'EST-001'},
    {id:2,rol:'conductor',nombre:'Carlos Quispe',email:'conductor@combiamigo.pe',password:'conductor123'}],
  estudiantes:[{id:'EST-001',nombre:'Pepito Torres',grado:'3° Primaria',padreId:1},{id:'EST-002',nombre:'Lucía Rojas',grado:'5° Primaria',padreId:null}],
  checkpoints:[
    cp('cp1','Punto de recogida','Recogida',-12.1219,-77.0300,'Casa del estudiante'),
    cp('cp2','Bodega Doña Rosa','Bodega aliada',-12.1100,-77.0350,'Paradero seguro aliado'),
    cp('cp3','Colegio San Martín','Colegio',-12.0980,-77.0380,'Destino final')],
  ruta:{estado:0,inicio:null}
};
function seedDemo(){
  if(Storage.get('seed'))return;
  Object.keys(DEMO).forEach(k=>Storage.set(k,DEMO[k]));
  Storage.set('pagos',[]);Storage.set('notifs',[]);Storage.set('historial',[]);Storage.set('seed',1);
}
