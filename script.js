const tempEl = document.getElementById('temp');
const cityNameEl = document.getElementById('cityName');
const conditionEl = document.getElementById('mainCondition');
const humidEl = document.getElementById('detailHumid');
const windEl = document.getElementById('detailWind');
const iconContainer = document.getElementById('weatherIcon');
const searchInput = document.getElementById('cityInput');

const timeEl = document.getElementById('current-time');
const fullDateEl = document.getElementById('current-day-date');

let timerInterval;


function updateDateTime(utcOffsetSeconds) {
    const now = new Date();
  
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (utcOffsetSeconds * 1000));
    
  
    const hours = String(localTime.getHours()).padStart(2, '0');
    const minutes = String(localTime.getMinutes()).padStart(2, '0');
    timeEl.innerText = `${hours}:${minutes}`;
    
 
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    fullDateEl.innerText = localTime.toLocaleDateString('en-GB', options);
}


function updateWeatherUI(code, isDay) {
    let iconClass = "fa-sun";
    let statusText = "Clear Sky";

    if (code >= 0 && code <= 2) {
        iconClass = isDay ? "fa-sun" : "fa-moon";
        statusText = "Clear Sky";
    } 

    else if (code === 3) {
        iconClass = isDay ? "fa-cloud-sun" : "fa-cloud-moon";
        statusText = "Partly Cloudy";
    } 
    else if (code === 45 || code === 48) {
        iconClass = "fa-smog";
        statusText = "Foggy";
    } 
    else if (code >= 51 && code <= 67) {
        iconClass = "fa-cloud-showers-heavy";
        statusText = "Rainy";
    } 
    else if (code >= 71 && code <= 77) {
        iconClass = "fa-snowflake";
        statusText = "Snowy";
    } 
    else if (code >= 95) {
        iconClass = "fa-cloud-bolt";
        statusText = "Thunderstorm";
    } 
    else {
        iconClass = "fa-cloud";
        statusText = "Overcast";
    }
    
    iconContainer.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    conditionEl.innerText = statusText;
}


async function searchCity(city) {
    if (!city) return;
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results) return;

        const { latitude, longitude, name } = geoData.results[0];
        
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day&timezone=auto`);
        const weatherData = await weatherRes.json();

        tempEl.innerText = `${Math.round(weatherData.current.temperature_2m)}°`;
        cityNameEl.innerText = name;
        humidEl.innerText = `${weatherData.current.relative_humidity_2m}%`;
        windEl.innerText = `${Math.round(weatherData.current.wind_speed_10m)}km/h`;
        
        updateWeatherUI(weatherData.current.weather_code, weatherData.current.is_day);

        if (timerInterval) clearInterval(timerInterval);
        
        updateDateTime(weatherData.utc_offset_seconds);
        timerInterval = setInterval(() => {
            updateDateTime(weatherData.utc_offset_seconds);
        }, 1000);
        
    } catch (err) { 
        console.error("Weather Fetch Error:", err); 
    }
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { 
        searchCity(searchInput.value); 
        searchInput.value = ""; 
    }
});

searchCity("Kathmandu");
