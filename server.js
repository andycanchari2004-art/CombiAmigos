/* Servidor de CombiAmigo (opcional, para usar 2 PC distintas): sirve la web y sincroniza el viaje en vivo (SSE). Uso: node server.js */
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),E=require('./js/estado.js');
let S=E.base();const clients=[];
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((q,r)=>{
  if(q.url==='/api/stream'){r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});r.write('data: '+JSON.stringify(S)+'\n\n');clients.push(r);q.on('close',()=>clients.splice(clients.indexOf(r),1));return}
  if(q.url==='/api/accion'&&q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{try{S=E.accion(S,JSON.parse(b));const d='data: '+JSON.stringify(S)+'\n\n';clients.forEach(c=>c.write(d))}catch(e){}r.end('ok')});return}
  let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/')f='/index.html';f=path.join(__dirname,path.normalize(f));
  if(!f.startsWith(__dirname)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('No encontrado')}
  r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
}).listen(3000,'0.0.0.0',()=>{console.log('CombiAmigo en http://localhost:3000');
  Object.values(os.networkInterfaces()).flat().filter(i=>i.family==='IPv4'&&!i.internal).forEach(i=>console.log('Desde otra PC/celular (misma red): http://'+i.address+':3000'))});
