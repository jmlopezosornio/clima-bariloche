'use strict';
const zone = 'America/Argentina/Buenos_Aires';
const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-41.1335&longitude=-71.3103&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=1&timeformat=unixtime';
function mapWeatherCode(code) {
 const descriptions={0:'Despejado',1:'Mayormente despejado',2:'Parcialmente nublado',3:'Nublado',45:'Niebla',48:'Niebla con escarcha',51:'Llovizna ligera',53:'Llovizna',55:'Llovizna intensa',56:'Llovizna helada',57:'Llovizna helada intensa',61:'Lluvia ligera',63:'Lluvia',65:'Lluvia intensa',66:'Lluvia helada',67:'Lluvia helada intensa',71:'Nieve ligera',73:'Nieve',75:'Nieve intensa',77:'Granos de nieve',80:'Chaparrones',81:'Chaparrones moderados',82:'Chaparrones intensos',85:'Chubascos de nieve',86:'Chubascos de nieve intensos',95:'Tormenta',96:'Tormenta con granizo',99:'Tormenta con granizo intenso'};
 const theme=[0,1].includes(code)?'soleado':[2,3].includes(code)?'nublado':[45,48].includes(code)?'niebla':[71,73,75,77,85,86].includes(code)?'nieve':[95,96,99].includes(code)?'tormenta':[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)?'lluvia':'nublado';
 return {theme,desc:descriptions[code] || 'Estado no disponible'};
}
const put=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
const number=(v,suffix='')=>Number.isFinite(v)?Math.round(v)+suffix:'--'+suffix;
let lastTime=null;
function render(data){
 const c=data.current;
 if(!c || !Number.isFinite(c.temperature_2m) || !Number.isFinite(c.time))throw Error('Datos incompletos');
 const w=mapWeatherCode(c.weather_code);
 document.body.style.setProperty('--sky',`url('img/fondo-${w.theme}.svg')`);
 document.body.dataset.night=String(c.is_day===0);
 const icon=document.getElementById('main-weather-icon');icon.src=`img/icono-${w.theme}.svg`;icon.alt=w.desc;
 put('main-temp',number(c.temperature_2m));put('weather-desc',w.desc);
 put('comfort-humidity',number(c.relative_humidity_2m,'%'));put('comfort-feels-like',number(c.apparent_temperature,'°C'));put('comfort-wind',number(c.wind_speed_10m,' km/h'));
 put('temp-range',`Mín. ${number(data.daily?.temperature_2m_min?.[0],'°')} · Máx. ${number(data.daily?.temperature_2m_max?.[0],'°')}`);
 lastTime=c.time;
 put('updated','Datos: '+new Intl.DateTimeFormat('es-AR',{timeZone:zone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(c.time*1000)));
 updateStatus();
}
function updateStatus(failed=false){put('connection',failed?(lastTime?'Sin conexión · último dato disponible':'No se pudo consultar el clima'):lastTime && Date.now()/1000-lastTime>3600?'Datos pendientes de actualización':'');}
async function getWeather(){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(apiUrl,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();render(data);try{localStorage.setItem('bariloche-weather-v2',JSON.stringify(data));}catch{}}
 catch(error){updateStatus(true);if(!lastTime)put('weather-desc','Clima no disponible');console.warn('No se pudo actualizar el clima:',error.message);}
 finally{clearTimeout(timer);}
}
function updateClock(){put('clock',new Intl.DateTimeFormat('es-AR',{timeZone:zone,day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()));}
try{const stored=JSON.parse(localStorage.getItem('bariloche-weather-v2'));if(stored?.current)render(stored);}catch{}
updateClock();setInterval(updateClock,1000);getWeather();setInterval(getWeather,10*60*1000);window.addEventListener('online',getWeather);
