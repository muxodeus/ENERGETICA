import{u as l,s as d,o as m,L as o,c as h,a as u}from"./index-Bh5gNEB5.js";const b={id:"map",style:{height:"600px"}},f={__name:"MapaLeaflet",setup(g){const r={Operativo:"green","En mantenimiento":"orange",Desconectado:"red"},n=t=>o.divIcon({className:"",html:`<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${t}" stroke="black" stroke-width="1"/></svg>`,iconAnchor:[12,12],popupAnchor:[0,-12]}),a=l(),{meters:s}=d(a);return m(async()=>{await a.fetchMeters();const t=o.map("map").setView([13.693,-89.218],13);o.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(t),s.value.forEach(e=>{const c=n(r[e.status]||"gray"),i=o.marker([e.lat,e.lng],{icon:c}).addTo(t),p=`
  <b>${e.name}</b><br />
  <b>Ubicación:</b> ${e.location}<br />
  <a href="/medidor/${e.id}">Ver detalles</a>
`;i.bindPopup(p)})}),(t,e)=>(u(),h("div",b))}};export{f as default};
