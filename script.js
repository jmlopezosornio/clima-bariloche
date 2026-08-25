// Configuración de la API (Bariloche, Argentina)
const lat = -41.1335;
const lon = -71.3103;
const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,uv_index&timezone=America%2FArgentina%2FSalta`;

// Función para mapear el código de clima de Open-Meteo
function mapWeatherCode(code) {
  // Solo definimos Nublado (code 3) según la imagen, el resto son placeholders.
  const map = {
    0: { desc: 'Despejado', icon: 'img/cloudy-with-sun.svg' }, // Debería ser sol puro
    1: { desc: 'Principalmente Despejado', icon: 'img/cloudy-with-sun.svg' },
    2: { desc: 'Parcialmente Nublado', icon: 'img/cloudy-with-sun.svg' },
    3: { desc: 'Nublado', icon: 'img/cloudy-with-sun.svg' },
    // Añadir más códigos según necesidad
  };
  return map[code] || { desc: 'Despejado', icon: 'img/cloudy-with-sun.svg' };
}

// Función principal para obtener datos
async function getWeather() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // 1. Temperatura Principal y Estado
    const current = data.current_weather;
    const weatherInfo = mapWeatherCode(current.weathercode);
    
    document.getElementById('main-temp').innerText = Math.round(current.temperature);
    document.getElementById('weather-desc').innerText = weatherInfo.desc;
    document.getElementById('main-weather-icon').src = weatherInfo.icon;

    // 2. Rango de Temperatura (Min/Max del día)
    // Para simplificar, tomamos la temp actual ± 2 grados
    const temp = Math.round(current.temperature);
    document.getElementById('temp-range').innerText = `${temp-1}/${temp+2}°C`;

    // 3. Comodidad: Humedad
    // Obtenemos la humedad de la hora actual (índice 0 en hourly)
    document.getElementById('comfort-humidity').innerText = `${data.hourly.relativehumidity_2m[0]}%`;

    // 4. Comodidad: Sensación Térmica
    document.getElementById('comfort-feels-like').innerText = `${Math.round(data.hourly.apparent_temperature[0])}°C`;

    // 5. Comodidad: Índice UV
    // El índice UV también se toma de hourly, índice 0
    document.getElementById('comfort-uv').innerText = Math.round(data.hourly.uv_index[0]);

  } catch (error) {
    console.error("Error cargando el clima:", error);
    document.getElementById('weather-desc').innerText = "Error";
  }
}

// Ejecutar al cargar
getWeather();