"use strict";
// CATÁLOGO TERRITORIAL: el catálogo completo (UBIGEO) se carga al iniciar.
// Si no hay conexión, se conserva este catálogo mínimo de respaldo.
let territorios={
 "Lima":{"Lima":["Miraflores","Chorrillos"],"Huaral":["Huaral","Aucallama"]},
 "Arequipa":{"Arequipa":["Cercado","Cayma"],"Camaná":["Camaná","Samuel Pastor"]},
 "Cusco":{"Cusco":["Cusco","San Sebastián"],"Urubamba":["Urubamba","Ollantaytambo"]},
 "La Libertad":{"Trujillo":["Trujillo","Víctor Larco"],"Ascope":["Ascope","Casa Grande"]},
 "Piura":{"Piura":["Piura","Castilla"],"Sullana":["Sullana","Bellavista"]}
};
let nombres=Object.keys(territorios);
let catalogoUbigeo={departamentos:[],provincias:[],distritos:[]};
const UBIGEO_BASE='https://raw.githubusercontent.com/RitchieRD/ubigeos-peru-data/main/json/';
function tituloTerritorial(nombre){const t=String(nombre||'').toLocaleLowerCase('es-PE').replace(/(^|[\s-])([a-záéíóúñ])/g,(m,p,c)=>p+c.toLocaleUpperCase('es-PE'));const acentos={'Ancash':'Áncash','Apurimac':'Apurímac','Huanuco':'Huánuco','Junin':'Junín','San Martin':'San Martín'};return acentos[t]||t;}
async function cargarCatalogoTerritorial(){
 try{
  const archivos=['1_ubigeo_departamentos.json','2_ubigeo_provincias.json','3_ubigeo_distritos.json'];
  const datos=await Promise.all(archivos.map(async archivo=>{
   const respuesta=await fetch(UBIGEO_BASE+archivo,{cache:'force-cache'});
   if(!respuesta.ok)throw new Error('No se pudo descargar '+archivo);
   return respuesta.json();
  }));
  const departamentos=datos[0].ubigeo_departamentos||[];
  const provincias=datos[1].ubigeo_provincias||[];
  const distritos=datos[2].ubigeo_distritos||[];
  if(departamentos.length<25||provincias.length<190||distritos.length<1800)throw new Error('El catálogo recibido está incompleto.');
  const deptById=new Map(departamentos.map(x=>[Number(x.id),tituloTerritorial(x.departamento)]));
  const provById=new Map(provincias.map(x=>[Number(x.id),{nombre:tituloTerritorial(x.provincia),depId:Number(x.departamento_id),ubigeo:String(x.ubigeo).padStart(4,'0')} ]));
  const siguiente={};
  departamentos.forEach(d=>siguiente[deptById.get(Number(d.id))]={});
  provincias.forEach(p=>{const dep=deptById.get(Number(p.departamento_id));if(dep)siguiente[dep][tituloTerritorial(p.provincia)]=[];});
  distritos.forEach(d=>{
   const dep=deptById.get(Number(d.departamento_id));
   const prov=provById.get(Number(d.provincia_id));
   if(dep&&prov&&siguiente[dep]&&siguiente[dep][prov.nombre])siguiente[dep][prov.nombre].push(tituloTerritorial(d.distrito));
  });
  // Orden alfabético y eliminación de duplicados dentro de cada provincia.
  Object.values(siguiente).forEach(provs=>Object.keys(provs).forEach(p=>provs[p]=[...new Set(provs[p])].sort((a,b)=>a.localeCompare(b,'es'))));
  territorios=siguiente;
  nombres=Object.keys(territorios).sort((a,b)=>a.localeCompare(b,'es'));
  catalogoUbigeo={departamentos,provincias,distritos};
  // Envía el catálogo al backend para que los paquetes model/repository/service/controller
  // también dispongan de los 25 ámbitos, las 196 provincias y los distritos durante la demo.
  const provIndex=new Map(provincias.map(x=>[Number(x.id),x]));
  const registrosCatalogo=[];
  departamentos.forEach(d=>registrosCatalogo.push({ubigeo:String(d.ubigeo).padStart(2,'0'),ubigeoPadre:null,nombre:tituloTerritorial(d.departamento),departamento:tituloTerritorial(d.departamento),provincia:null,nivel:'DEPARTAMENTO'}));
  provincias.forEach(pr=>{
   const dep=departamentos.find(d=>Number(d.id)===Number(pr.departamento_id));
   registrosCatalogo.push({ubigeo:String(pr.ubigeo).padStart(4,'0'),ubigeoPadre:dep?String(dep.ubigeo).padStart(2,'0'):null,nombre:tituloTerritorial(pr.provincia),departamento:dep?tituloTerritorial(dep.departamento):'',provincia:tituloTerritorial(pr.provincia),nivel:'PROVINCIA'});
  });
  distritos.forEach(di=>{
   const pr=provIndex.get(Number(di.provincia_id));
   const dep=departamentos.find(d=>Number(d.id)===Number(di.departamento_id));
   registrosCatalogo.push({ubigeo:String(di.ubigeo).padStart(6,'0'),ubigeoPadre:pr?String(pr.ubigeo).padStart(4,'0'):null,nombre:tituloTerritorial(di.distrito),departamento:dep?tituloTerritorial(dep.departamento):'',provincia:pr?tituloTerritorial(pr.provincia):'',nivel:'DISTRITO'});
  });
  let backendOk=false;
  try{
   const respuestaBackend=await fetch('/api/v1/territorios/catalogo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(registrosCatalogo)});
   backendOk=respuestaBackend.ok;
  }catch(error){console.warn('El catálogo está disponible en el navegador, pero no se pudo registrar en el backend.',error);}
  console.info(`Catálogo territorial cargado: ${departamentos.length} ámbitos departamentales, ${provincias.length} provincias y ${distritos.length} distritos.`);
  return {completo:true,backendOk,departamentos:departamentos.length,provincias:provincias.length,distritos:distritos.length};
 }catch(error){
  console.warn('No se pudo cargar el catálogo UBIGEO completo; se utilizará el respaldo.',error);
  return {completo:false,departamentos:nombres.length,provincias:Object.values(territorios).reduce((n,x)=>n+Object.keys(x).length,0),distritos:Object.values(territorios).reduce((n,x)=>n+Object.values(x).reduce((a,y)=>a+y.length,0),0)};
 }
}
function hashTexto(texto){let h=2166136261;for(let i=0;i<texto.length;i++){h^=texto.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function factorDeterminista(texto){return 0.55+(hashTexto(texto)%1000)/1000*1.25;}
const indicadores={denuncias:{nombre:"Denuncias registradas",def:"Cantidad ficticia de denuncias registradas en el periodo."},robos:{nombre:"Robos reportados",def:"Cantidad ficticia de reportes de robo en el periodo."},hurtos:{nombre:"Hurtos reportados",def:"Cantidad ficticia de reportes de hurto en el periodo."}};
const base={denuncias:950,robos:390,hurtos:560};
// Todos los valores estadísticos y poblacionales de esta demo son sintéticos.
// La generación determinista permite que un mismo filtro siempre muestre el mismo valor.
function poblacionSimulada(dep,prov="Todos",dist="Todos"){
 const clave=[dep,prov,dist].join('|');
 if(dep==='Todos')return 34000000;
 if(prov==='Todos')return 450000+ (hashTexto(clave)%8500000);
 if(dist==='Todos')return 18000+ (hashTexto(clave)%520000);
 return 2500+ (hashTexto(clave)%145000);
}
function tasaSimulada(casos,poblacion,anios=1){return poblacion>0&&anios>0?(casos/(poblacion*anios))*100000:0;}
function formatoTasa(tasa){return tasa.toLocaleString('es-PE',{minimumFractionDigits:1,maximumFractionDigits:1});}
function perfilActual(){
 const q=new URLSearchParams(location.search).get('perfil');
 if(q==='ciudadano'||q==='investigador')localStorage.setItem('obs-perfil',q);
 return localStorage.getItem('obs-perfil')||'ciudadano';
}
function aplicarPerfil(){
 const perfil=perfilActual();
 document.body.dataset.perfil=perfil;
 document.body.classList.toggle('perfil-ciudadano',perfil==='ciudadano');
 document.body.classList.toggle('perfil-investigador',perfil==='investigador');
 document.querySelectorAll('.enlaces a[href="/comparaciones"], .enlaces a[href="/mapa"]').forEach(a=>{
  a.hidden=perfil==='ciudadano';
 });
 document.querySelectorAll('.enlaces a[href="/indicadores"]').forEach(a=>{
  a.href='/indicadores?perfil='+perfil;
 });
 const volver=document.querySelector('a[href="/indicadores"]');
 if(volver)volver.href='/indicadores?perfil='+perfil;
 const perfilTexto=$('perfil-descripcion');
 if(perfilTexto){
  perfilTexto.textContent=perfil==='ciudadano'
   ?'Modo ciudadano: completa los pasos básicos para consultar información. Los filtros avanzados están ocultos para mantener una experiencia sencilla.'
   :'Modo investigador: tienes disponibles filtros territoriales, periodos y herramientas de análisis.';
  perfilTexto.classList.add('mensaje');
  const h=$('titulo-consulta');if(h)h.textContent=perfil==='ciudadano'?'Consulta guiada de indicadores':'Consulta avanzada de indicadores';
 }
}
const $=id=>document.getElementById(id);
// nombres se actualiza después de cargar el catálogo UBIGEO.

function opciones(sel,items){sel.replaceChildren(...items.map(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;return o;}));}
function valor(ind,dep,anio,prov="Todos",dist="Todos"){
 const nivel=dist!=="Todos"?0.035:prov!=="Todos"?0.22:1;
 const f=factorDeterminista([dep,prov,dist,ind].join('|'));
 const crecimiento=1+(Number(anio)-2022)*.055;
 return Math.max(1,Math.round(base[ind]*f*nivel*crecimiento));
}
// Buscador compartido entre Consulta y Mapa. Evita referencias inexistentes.
function sugerencias(inputId, listaId, selectId){
 const input=$(inputId), lista=$(listaId), select=$(selectId);
 if(!input||!lista||!select)return;
 const actualizar=()=>{
  const q=input.value.trim().toLocaleLowerCase('es');
  lista.replaceChildren();
  if(!q)return;
  const encontrados=Object.entries(indicadores).filter(([clave,info])=>info.nombre.toLocaleLowerCase('es').includes(q));
  if(encontrados.length===1){select.value=encontrados[0][0];select.dispatchEvent(new Event('change'));}
  if(!encontrados.length){const aviso=document.createElement('span');aviso.textContent='No hay indicadores coincidentes. Prueba con robos, hurtos o denuncias.';lista.append(aviso);return;}
  encontrados.forEach(([clave,info])=>{
   const btn=document.createElement('button');btn.type='button';btn.className='boton secundario';
   btn.textContent=info.nombre;btn.addEventListener('click',()=>{
    select.value=clave;input.value=info.nombre;lista.replaceChildren();select.dispatchEvent(new Event('change'));select.focus();
   });lista.append(btn);
  });
 };
 input.addEventListener('input',actualizar);
 select.addEventListener('change',()=>{if(input.value.trim() && !indicadores[select.value].nombre.toLocaleLowerCase('es').includes(input.value.trim().toLocaleLowerCase('es')))input.value='';lista.replaceChildren();});
 actualizar();
}
const ANIOS=[2022,2023,2024,2025];
function periodoDatos(prefix){
 const modo=$(prefix+'-modo').value;
 const desde=modo==='unico'?Number($(prefix+'-anio').value):Number($(prefix+'-inicio').value);
 const hasta=modo==='unico'?desde:Number($(prefix+'-fin').value);
 const valido=ANIOS.includes(desde)&&ANIOS.includes(hasta)&&desde<=hasta;
 $(prefix+'-error').hidden=valido;
 return valido?{modo,desde,hasta}:null;
}
function periodoConfig(prefix,onChange){
 const refrescar=()=>{
  const rango=$(prefix+'-modo').value==='rango';
  $(prefix+'-unico-caja').hidden=rango;
  $(prefix+'-inicio-caja').hidden=!rango;
  $(prefix+'-fin-caja').hidden=!rango;
  const valido=periodoDatos(prefix)!==null;
  if(onChange && valido)onChange();
 };
 ['modo','anio','inicio','fin'].forEach(s=>$(prefix+'-'+s).addEventListener('change',refrescar));
 refrescar();
}
function periodoTexto(p){return p.desde===p.hasta?String(p.desde):`${p.desde}–${p.hasta}`;}
function periodoSerie(p,ind,dep,prov='Todos',dist='Todos'){
 return ANIOS.filter(a=>a>=p.desde&&a<=p.hasta).map(a=>({a,v:valor(ind,dep,a,prov,dist)}));
}
function periodoTotal(p,ind,dep,prov='Todos',dist='Todos'){
 return periodoSerie(p,ind,dep,prov,dist).reduce((t,r)=>t+r.v,0);
}
function leerPeriodo(data){
 const desde=Number(data.desde??data.anio??2025),hasta=Number(data.hasta??data.anio??2025);
 return ANIOS.includes(desde)&&ANIOS.includes(hasta)&&desde<=hasta?{desde,hasta,modo:desde===hasta?'unico':'rango'}:null;
}
function guardarConsulta(datos){
 datos.perfil=perfilActual();
 try{sessionStorage.setItem('obs-consulta',JSON.stringify(datos));}
 catch(err){console.warn('No se pudo guardar la selección en sessionStorage',err);}
 const params=new URLSearchParams(datos);
 window.location.assign('/resultados?'+params.toString());
}
function provincias(){const dep=$('departamento').value;const provs=dep==='Todos'?[]:Object.keys(territorios[dep]||{});opciones($('provincia'),['Todos',...provs]);$('provincia').value='Todos';$('provincia').disabled=dep==='Todos';distritos();}
function distritos(){const dep=$('departamento').value,prov=$('provincia').value;const dist=prov==='Todos'?[]:((territorios[dep]||{})[prov]||[]);opciones($('distrito'),['Todos',...dist]);$('distrito').disabled=prov==='Todos';}
function celda(tr,tag,txt){const el=document.createElement(tag);el.textContent=txt; if(tag==='th')el.scope='row';tr.append(el);}
let tipoGrafico='lineas';
function dibujar(serie){
 const svg=$('grafico');if(!svg||!serie.length)return;
 svg.querySelectorAll('.generado').forEach(n=>n.remove());
 const NS='http://www.w3.org/2000/svg';
 function nodo(tag,attrs,contenido){const e=document.createElementNS(NS,tag);e.classList.add('generado');for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(contenido!==undefined)e.textContent=contenido;svg.append(e);return e;}
 const max=Math.max(1,...serie.map(x=>x.v))*1.18;
 const xs=serie.map((_,i)=>serie.length===1?345:120+i*(450/(serie.length-1))), ys=serie.map(x=>250-(x.v/max)*205);
 const tinta=document.body.classList.contains('contraste')?'#ffff00':'#17639b';
 [0,.25,.5,.75,1].forEach(f=>{const y=250-f*205;nodo('line',{x1:70,y1:y,x2:620,y2:y,stroke:'currentColor','stroke-opacity':.25});nodo('text',{x:60,y:y+5,'text-anchor':'end'},Math.round(max*f).toLocaleString('es-PE'));});
 if(tipoGrafico==='barras'){
   serie.forEach((r,i)=>nodo('rect',{x:xs[i]-27,y:ys[i],width:54,height:Math.max(0,250-ys[i]),fill:tinta,rx:3}));
 }else{
   nodo('polyline',{points:xs.map((x,i)=>`${x},${ys[i]}`).join(' '),fill:'none',stroke:tinta,'stroke-width':4});
   serie.forEach((r,i)=>nodo('circle',{cx:xs[i],cy:ys[i],r:7,fill:tinta}));
 }
 serie.forEach((r,i)=>nodo('text',{x:xs[i],y:282,'text-anchor':'middle'},r.a));
 const nombre=tipoGrafico==='barras'?'barras':'líneas';
 $('grafico-titulo').textContent=`Gráfico de ${nombre}: evolución anual del indicador`;
 $('grafico-desc').textContent='Valores simulados por año. La tabla que sigue presenta los mismos datos.';
 $('tipo-grafico-estado').textContent=`Mostrando gráfico de ${nombre}. La tabla accesible contiene los mismos valores.`;
}
function initTipoGrafico(){
 const botones=document.querySelectorAll('[data-tipo-grafico]');if(!botones.length)return;
 botones.forEach(b=>b.addEventListener('click',()=>{
  tipoGrafico=b.dataset.tipoGrafico;
  botones.forEach(x=>{const activo=x===b;x.setAttribute('aria-pressed',String(activo));x.classList.toggle('activo',activo);});
  if(ultima.length)dibujar(ultima);
 }));
}

let ultima=[];
function comparar(ev){
 ev.preventDefault();const a=$('comparar-a').value,b=$('comparar-b').value,ind=$('comparar-indicador').value,p=periodoDatos('comparar-periodo');
 if(!p){$('mensaje-comparacion').textContent='Corrige el rango de años.';return;}
 if(a===b){$('mensaje-comparacion').textContent='Selecciona dos departamentos distintos para comparar.';$('mensaje-comparacion').classList.add('error');return;}
 $('mensaje-comparacion').classList.remove('error');
 $('mensaje-comparacion').textContent=`Comparación demostrativa de ${indicadores[ind].nombre}, periodo ${periodoTexto(p)}. Se muestran casos acumulados y una tasa calculada con población ficticia; no son estadísticas oficiales.`;
 const tbody=$('tabla-comparar');tbody.replaceChildren();
 [a,b].forEach(dep=>{const tr=document.createElement('tr');const casos=periodoTotal(p,ind,dep);const poblacion=poblacionSimulada(dep);const tasa=tasaSimulada(casos,poblacion,p.hasta-p.desde+1);celda(tr,'th',dep);celda(tr,'td',casos.toLocaleString('es-PE'));celda(tr,'td',poblacion.toLocaleString('es-PE'));celda(tr,'td',formatoTasa(tasa));celda(tr,'td',periodoTexto(p));tbody.append(tr);});
}
const coordenadas={
 'Amazonas':[-6.2317,-77.869], 'Áncash':[-9.5278,-77.5278], 'Apurímac':[-13.6339,-72.8814],
 'Arequipa':[-16.3989,-71.535], 'Ayacucho':[-13.1588,-74.2239], 'Cajamarca':[-7.1617,-78.5128],
 'Callao':[-12.0566,-77.1181], 'Cusco':[-13.5319,-71.9675], 'Huancavelica':[-12.7862,-74.9764],
 'Huánuco':[-9.9298,-76.2422], 'Ica':[-14.0678,-75.7286], 'Junín':[-12.0651,-75.2049],
 'La Libertad':[-8.1116,-79.0287], 'Lambayeque':[-6.7714,-79.8409], 'Lima':[-12.0464,-77.0428],
 'Loreto':[-3.7491,-73.2538], 'Madre de Dios':[-12.5933,-69.1891], 'Moquegua':[-17.1949,-70.9353],
 'Pasco':[-10.6833,-76.2567], 'Piura':[-5.1945,-80.6328], 'Puno':[-15.8402,-70.0219],
 'San Martín':[-6.0342,-76.9717], 'Tacna':[-18.0066,-70.2463], 'Tumbes':[-3.5669,-80.4515],
 'Ucayali':[-8.3791,-74.5539]
};
function coordTerritorial(dep,prov='Todos',dist='Todos'){
 const baseCoord=coordenadas[dep]||[-9.19,-75.015];
 const seed=hashTexto([dep,prov,dist].join('|'));
 const radio=dist!=='Todos'?0.025:prov!=='Todos'?0.07:0.11;
 const dLat=(((seed%10000)/10000)-0.5)*radio;
 const dLng=((((seed>>>8)%10000)/10000)-0.5)*radio*1.3;
 return [baseCoord[0]+dLat,baseCoord[1]+dLng];
}
let mapaLeaflet=null, capaMarcadores=null, capaCalor=null, tipoCapaMapa='calor';
function poblarMapaProvincias(){const dep=$('mapa-departamento').value;const lista=dep==='Todos'?[]:Object.keys(territorios[dep]||{});opciones($('mapa-provincia'),['Todos',...lista]);$('mapa-provincia').value='Todos';$('mapa-provincia').disabled=dep==='Todos';poblarMapaDistritos();}
function poblarMapaDistritos(){const dep=$('mapa-departamento').value,prov=$('mapa-provincia').value;const lista=prov==='Todos'?[]:((territorios[dep]||{})[prov]||[]);opciones($('mapa-distrito'),['Todos',...lista]);$('mapa-distrito').disabled=prov==='Todos';}
function elegirMapa(dep,prov='Todos',dist='Todos'){$('mapa-departamento').value=dep;poblarMapaProvincias();$('mapa-provincia').value=prov;poblarMapaDistritos();$('mapa-distrito').value=dist;actualizarMapa(true);}
function puntosCalor(territoriosFiltrados,ind,p){
 const puntos=[];
 territoriosFiltrados.forEach(([dep,prov,dist])=>{
  const centro=coordTerritorial(dep,prov,dist);
  const cantidad=dist!=='Todos'?18:prov!=='Todos'?28:14;
  const casos=periodoTotal(p,ind,dep,prov,dist);
  const intensidad=Math.min(1,Math.max(.18,casos/1800));
  const seed=hashTexto([dep,prov,dist,ind].join('|'));
  for(let i=0;i<cantidad;i++){
   const a=((seed+i*7919)%10000)/10000*Math.PI*2;
   const r=.012+(((seed+i*3571)%10000)/10000)*(dist!=='Todos'?.018:prov!=='Todos'?.055:.095);
   puntos.push([centro[0]+Math.sin(a)*r,centro[1]+Math.cos(a)*r*1.25,intensidad]);
  }
 });
 return puntos;
}
function activarCapaMapa(tipo){
 tipoCapaMapa=tipo;
 document.querySelectorAll('[data-mapa-capa]').forEach(b=>{const activo=b.dataset.mapaCapa===tipo;b.setAttribute('aria-pressed',String(activo));b.classList.toggle('activo',activo);});
 if(!mapaLeaflet)return;
 if(tipo==='calor'){
  if(capaMarcadores&&mapaLeaflet.hasLayer(capaMarcadores))mapaLeaflet.removeLayer(capaMarcadores);
  if(capaCalor&&!mapaLeaflet.hasLayer(capaCalor))capaCalor.addTo(mapaLeaflet);
 }else{
  if(capaCalor&&mapaLeaflet.hasLayer(capaCalor))mapaLeaflet.removeLayer(capaCalor);
  if(capaMarcadores&&!mapaLeaflet.hasLayer(capaMarcadores))capaMarcadores.addTo(mapaLeaflet);
 }
}
function actualizarMapa(centrar=false){
 const dep=$('mapa-departamento').value,prov=$('mapa-provincia').value,dist=$('mapa-distrito').value;
 const ind=$('mapa-indicador').value,p=periodoDatos('mapa-periodo');if(!p)return;
 const zona=dep==='Todos'?'Todo el Perú':[dep,prov,dist].filter(x=>x!=='Todos').join(' · ');
 const seleccion=dep==='Todos'?nombres.map(d=>[d,'Todos','Todos']):dist!=='Todos'?[[dep,prov,dist]]:prov!=='Todos'?((territorios[dep]||{})[prov]||[]).map(d=>[dep,prov,d]):[[dep,'Todos','Todos']];
 const total=dep==='Todos'?nombres.reduce((s,d)=>s+periodoTotal(p,ind,d),0):periodoTotal(p,ind,dep,prov,dist);
 $('detalle-mapa').textContent=`${indicadores[ind].nombre} · ${zona} · periodo ${periodoTexto(p)}: ${total.toLocaleString('es-PE')} casos simulados. Los puntos del mapa son una distribución sintética, no incidentes reales.`;
 $('mapa-caption').textContent=`${indicadores[ind].nombre}, periodo ${periodoTexto(p)}. Valores ficticios para ${zona}.`;
 const tb=$('tabla-mapa');tb.replaceChildren();
 const items=dep==='Todos'?nombres.map(d=>[d,'Todos','Todos']):dist!=='Todos'?[[dep,prov,dist]]:prov!=='Todos'?((territorios[dep]||{})[prov]||[]).map(d=>[dep,prov,d]):[[dep,'Todos','Todos']];
 items.forEach(([d,pv,di])=>{
  const tr=document.createElement('tr');const nombre=[d,pv,di].filter(x=>x!=='Todos').join(' · ');
  const casos=periodoTotal(p,ind,d,pv,di);const poblacion=poblacionSimulada(d,pv,di);
  celda(tr,'th',nombre);celda(tr,'td',casos.toLocaleString('es-PE'));
  celda(tr,'td',formatoTasa(tasaSimulada(casos,poblacion,p.hasta-p.desde+1)));
  const td=document.createElement('td');const btn=document.createElement('button');btn.type='button';btn.className='boton secundario';btn.textContent='Elegir';btn.setAttribute('aria-label','Seleccionar '+nombre);
  btn.addEventListener('click',()=>{
   if(di!=='Todos')elegirMapa(d,pv,di);else if(pv!=='Todos')elegirMapa(d,pv);else elegirMapa(d);
  });td.append(btn);tr.append(td);tb.append(tr);
 });
 if(mapaLeaflet){
  if(capaMarcadores)capaMarcadores.clearLayers();
  const grupos=dep==='Todos'?nombres.map(d=>[d,'Todos','Todos']):dist!=='Todos'?[[dep,prov,dist]]:prov!=='Todos'?[[dep,prov,'Todos']]:[[dep,'Todos','Todos']];
  const calor=puntosCalor(grupos,ind,p);
  if(capaCalor)capaCalor.setLatLngs(calor);
  grupos.forEach(([d,pv,di])=>{
   const coords=coordTerritorial(d,pv,di);const marker=L.marker(coords).addTo(capaMarcadores);
   const casos=periodoTotal(p,ind,d,pv,di);const poblacion=poblacionSimulada(d,pv,di);
   const nombre=[d,pv,di].filter(x=>x!=='Todos').join(' · ');
   marker.bindPopup(`<strong>${nombre}</strong><br>${indicadores[ind].nombre}: ${casos.toLocaleString('es-PE')} (simulado)<br>Tasa ilustrativa: ${formatoTasa(tasaSimulada(casos,poblacion,p.hasta-p.desde+1))} por 100 000 hab. (denominador ficticio)`);
   marker.on('click',()=>{if(di!=='Todos')elegirMapa(d,pv,di);else if(pv!=='Todos')elegirMapa(d,pv);else elegirMapa(d);});
  });
  if(centrar&&dep!=='Todos'){
   const coords=coordTerritorial(dep,prov,dist);
   mapaLeaflet.setView(coords,dist!=='Todos'?12:prov!=='Todos'?10:7);
  }else if(centrar||dep==='Todos'){
   const bounds=nombres.map(d=>coordenadas[d]).filter(Boolean);if(bounds.length)mapaLeaflet.fitBounds(bounds,{padding:[18,18]});
  }
  activarCapaMapa(tipoCapaMapa);
 }
}
function initMapa(){
 opciones($('mapa-departamento'),['Todos',...nombres]);$('mapa-departamento').value='Todos';poblarMapaProvincias();
 sugerencias('mapa-busqueda','mapa-coincidencias','mapa-indicador');
 $('mapa-departamento').addEventListener('change',()=>{poblarMapaProvincias();actualizarMapa(true);});
 $('mapa-provincia').addEventListener('change',()=>{poblarMapaDistritos();actualizarMapa(true);});
 ['mapa-distrito','mapa-indicador'].forEach(id=>$(id).addEventListener('change',()=>actualizarMapa(true)));
 document.querySelectorAll('[data-mapa-capa]').forEach(b=>b.addEventListener('click',()=>activarCapaMapa(b.dataset.mapaCapa)));
 $('mapa-consultar').addEventListener('click',()=>{const p=periodoDatos('mapa-periodo');if(!p)return;guardarConsulta({desde:p.desde,hasta:p.hasta,indicador:$('mapa-indicador').value,busqueda:indicadores[$('mapa-indicador').value].nombre,departamento:$('mapa-departamento').value,provincia:$('mapa-provincia').value,distrito:$('mapa-distrito').value,anio:p.hasta});});
 $('mapa-restablecer').addEventListener('click',()=>{$('mapa-busqueda').value='';$('mapa-coincidencias').replaceChildren();$('mapa-indicador').value='denuncias';$('mapa-periodo-modo').value='unico';$('mapa-periodo-anio').value='2025';$('mapa-periodo-inicio').value='2022';$('mapa-periodo-fin').value='2025';$('mapa-periodo-modo').dispatchEvent(new Event('change'));$('mapa-departamento').value='Todos';poblarMapaProvincias();actualizarMapa(true);});
 if(typeof L!=='undefined'){
  mapaLeaflet=L.map('mapa-geografico',{scrollWheelZoom:false}).setView([-9.19,-75.015],5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors',maxZoom:18}).addTo(mapaLeaflet);
  capaMarcadores=L.layerGroup();
  if(typeof L.heatLayer==='function')capaCalor=L.heatLayer([],{radius:27,blur:20,maxZoom:10,minOpacity:.28});
  if(!capaCalor){const aviso=$('aviso-calor');if(aviso)aviso.textContent='No se pudo cargar el complemento de mapa de calor. Se muestran marcadores; comprueba tu conexión.';tipoCapaMapa='marcadores';}
 }else{const p=document.createElement('p');p.className='mensaje error';p.textContent='No se pudo cargar el mapa geográfico. Comprueba la conexión a internet; los filtros y la tabla siguen disponibles.';$('mapa-geografico').replaceWith(p);}
 periodoConfig('mapa-periodo',()=>actualizarMapa());
 actualizarMapa(true);
}
function initConsulta(){
 opciones($('departamento'),nombres);$('departamento').value='Lima';provincias();$('departamento').addEventListener('change',provincias);$('provincia').addEventListener('change',distritos);
 periodoConfig('periodo');$('filtros').addEventListener('submit',enviarConsulta);sugerencias('busqueda','coincidencias','indicador');
 $('limpiar').addEventListener('click',()=>{$('busqueda').value='';$('coincidencias').replaceChildren();$('indicador').value='denuncias';$('departamento').value='Lima';provincias();$('periodo-modo').value='unico';$('periodo-anio').value='2025';$('periodo-inicio').value='2022';$('periodo-fin').value='2025';$('periodo-modo').dispatchEvent(new Event('change'));$('mensaje').textContent='Filtros restablecidos.';});
}
function enviarConsulta(ev){ev.preventDefault();
 const p=periodoDatos('periodo');if(!p){$('mensaje').textContent='Corrige el rango de años.';return;}
 const q=$('busqueda').value.trim().toLocaleLowerCase('es');const matches=Object.entries(indicadores).filter(([k,v])=>v.nombre.toLocaleLowerCase('es').includes(q));
 if(q && !matches.length){$('mensaje').textContent='No hay coincidencias. Borra la búsqueda o selecciona un indicador.';$('mensaje').classList.add('error');return;}
 // Si se escribió una búsqueda inequívoca, utilizarla sin exigir que coincida con la selección anterior.
 const ind=q && matches.length===1?matches[0][0]:$('indicador').value;
 guardarConsulta({indicador:ind,busqueda:indicadores[ind].nombre,departamento:$('departamento').value,provincia:$('provincia').value,distrito:$('distrito').value,anio:p.hasta,desde:p.desde,hasta:p.hasta});
}
function initResultados(){
 let data=null;
 const params=new URLSearchParams(window.location.search);
 if(params.has('indicador'))data=Object.fromEntries(params.entries());
 if(!data){try{data=JSON.parse(sessionStorage.getItem('obs-consulta')||'null');}catch(e){data=null;}}
 if(!data || !indicadores[data.indicador] || !territorios[data.departamento]){
  $('mensaje').textContent='No hay una consulta válida. Entra en «Consultar indicadores» y selecciona los filtros.';
  $('resultados').hidden=true;return;
 }
 const p=leerPeriodo(data);
 if(!p){$('mensaje').textContent='El periodo seleccionado no es válido.';$('resultados').hidden=true;return;}
 const ind=data.indicador,dep=data.departamento;
 const prov=territorios[dep][data.provincia]?data.provincia:'Todos';
 const dist=prov!=='Todos' && territorios[dep][prov].includes(data.distrito)?data.distrito:'Todos';
 const zona=[dep,prov,dist].filter(x=>x!=='Todos').join(' · ');
 ultima=periodoSerie(p,ind,dep,prov,dist);
 const total=ultima.reduce((t,r)=>t+r.v,0);
 $('titulo-resultados').textContent=indicadores[ind].nombre;
 $('subtitulo-resultados').textContent=`${zona} · periodo ${periodoTexto(p)} · datos simulados`;
 $('definicion').textContent=indicadores[ind].def;
 $('tabla-caption').textContent=`${indicadores[ind].nombre} en ${zona}, periodo ${periodoTexto(p)}, valores simulados`;
 const cuerpo=$('tabla-valores');cuerpo.replaceChildren();
 ultima.forEach((r,i)=>{const tr=document.createElement('tr');celda(tr,'th',r.a);celda(tr,'td',r.v.toLocaleString('es-PE'));celda(tr,'td',i===0?'Sin año previo en el periodo':((r.v/ultima[i-1].v-1)*100).toFixed(1)+' %');cuerpo.append(tr);});
 dibujar(ultima);
 $('tendencia-texto').textContent=ultima.length===1?`Resumen en texto: ${ultima[0].v.toLocaleString('es-PE')} casos simulados en ${p.desde}.`:`Resumen en texto: la serie pasa de ${ultima[0].v.toLocaleString('es-PE')} casos simulados en ${p.desde} a ${ultima.at(-1).v.toLocaleString('es-PE')} en ${p.hasta}. Total acumulado: ${total.toLocaleString('es-PE')}.`;
 $('mensaje').textContent=`Consulta realizada. ${indicadores[ind].nombre}, ${zona}, periodo ${periodoTexto(p)}: ${total.toLocaleString('es-PE')} casos simulados${ultima.length>1?' acumulados':''}.`;
 const ficha=$('ficha-periodo');if(ficha)ficha.textContent=periodoTexto(p);
 $('descargar').addEventListener('click',()=>descargarConDatos({indicador:ind,departamento:dep,provincia:prov,distrito:dist,desde:p.desde,hasta:p.hasta}));
}
function descargarConDatos(data){
 const rows=[['METADATO','VALOR'],['Indicador',indicadores[data.indicador].nombre],['Departamento',data.departamento],['Provincia',data.provincia],['Distrito',data.distrito],['Unidad','Casos simulados'],['Fuente','Datos ficticios para prototipo UPN'],['Periodo',periodoTexto(data)],['Actualización','Octubre 2026'],['Metodología','Serie sintética sin validez estadística'],[],['Año','Casos simulados'],...ultima.map(x=>[x.a,x.v])];
 const csv='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='observatorio_datos_simulados.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function initComparaciones(){periodoConfig('comparar-periodo');opciones($('comparar-a'),nombres);opciones($('comparar-b'),nombres);$('comparar-b').value='Arequipa';$('form-comparar').addEventListener('submit',comparar);comparar(new Event('submit'));}
function initPreferencias(){
 let tam=Number(localStorage.getItem('obs-tam')||16);
 let alto=localStorage.getItem('obs-contraste')==='true';
 function aplicar(){document.documentElement.style.setProperty('--base',tam+'px');document.body.classList.toggle('contraste',alto);$('contraste').setAttribute('aria-pressed',String(alto));$('contraste').textContent=`Alto contraste: ${alto?'activado':'desactivado'}`;localStorage.setItem('obs-tam',String(tam));localStorage.setItem('obs-contraste',String(alto));if(ultima.length&&$('grafico'))dibujar(ultima);}
 $('texto-mas').addEventListener('click',()=>{tam=Math.min(32,tam+2);aplicar();});
 $('texto-menos').addEventListener('click',()=>{tam=Math.max(16,tam-2);aplicar();});
 $('contraste').addEventListener('click',()=>{alto=!alto;aplicar();});
 $('restablecer').addEventListener('click',()=>{tam=16;alto=false;aplicar();});aplicar();
}
document.addEventListener('DOMContentLoaded',async()=>{
 initPreferencias();
 aplicarPerfil();
 const estadoCatalogo=await cargarCatalogoTerritorial();
 document.querySelectorAll('[data-catalogo-status]').forEach(el=>{
  el.textContent=estadoCatalogo.completo
   ?`Catálogo UBIGEO cargado: ${estadoCatalogo.departamentos} ámbitos departamentales, ${estadoCatalogo.provincias} provincias y ${estadoCatalogo.distritos} distritos. ${estadoCatalogo.backendOk?'Catálogo registrado en el backend en memoria.':'Disponible en los filtros del navegador.'}`
   :'No se pudo cargar el catálogo completo. Revisa la conexión a internet; se habilitó un catálogo reducido de respaldo.';
  el.classList.toggle('error',!estadoCatalogo.completo);
 });
 if($('filtros'))initConsulta();
 if($('resultados')){initTipoGrafico();initResultados();}
 if($('form-comparar'))initComparaciones();
 if($('mapa-geografico'))initMapa();
});
