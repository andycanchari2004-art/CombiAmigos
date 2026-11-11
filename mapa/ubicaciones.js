const Ubicaciones={distancia(a,b,c,d){const R=6371000,t=x=>x*Math.PI/180,dl=t(c-a),dg=t(d-b);
  const h=Math.sin(dl/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))}};
