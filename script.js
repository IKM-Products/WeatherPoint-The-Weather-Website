// A mapping from Open-Meteo codes to readable text and Font Awesome icons
const weatherConditions = {
    0: { text: 'Clear Sky', icon: 'fa-sun' },
    1: { text: 'Mainly Clear', icon: 'fa-cloud-sun' },
    2: { text: 'Partly Cloudy', icon: 'fa-cloud' },
    3: { text: 'Overcast', icon: 'fa-cloud' },
    45: { text: 'Fog', icon: 'fa-smog' },
    61: { text: 'Slight Rain', icon: 'fa-cloud-showers-heavy' },
    80: { text: 'Showers', icon: 'fa-cloud-rain' },
};

// Map the numeric day (0-6) to day names
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Elements we need to update
const heroPanelEl = document.getElementById('heroPanel');
const mainTempEl = document.getElementById('mainTemp');
const cityNameEl = document.getElementById('cityName');
const localTimeEl = document.getElementById('localTime');
const mainConditionEl = document.getElementById('mainCondition');
const mainIconEl = document.getElementById('mainIcon');
const cloudDetailEl = document.getElementById('detailCloud');
const humidDetailEl = document.getElementById('detailHumid');
const windDetailEl = document.getElementById('detailWind');
const rainDetailEl = document.getElementById('detailRain');
const searchInputEl = document.getElementById('cityInput');

// 1. Initial State: Load London on startup
async function initiateApp() {
    await searchCity("London");
}

async function searchCity(city) {
    if (!city) return alert("Please enter a city name");

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    
    try {
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) throw new Error("City not found");
        
        const { latitude, longitude, name, country } = geoData.results[0];
        const displayCity = `${name}, ${country}`;
        
        fetchWeather(latitude, longitude, displayCity);
    } catch (err) {
        alert(err.message);
    }
}

async function fetchWeather(lat, lon, cityName) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,cloud_cover&timezone=auto`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();

        const current = data.current;
        const condition = weatherConditions[current.weather_code] || { text: 'Unknown', icon: 'fa-question' };

        // --- UPDATE THE BACKGROUND STATE ---
        heroPanelEl.classList.remove('clear', 'cloud', 'rain', 'snow');

        if (current.weather_code === 0 || current.weather_code === 1) {
            heroPanelEl.classList.add('clear');
        } else if (current.weather_code >= 2 && current.weather_code <= 3) {
            heroPanelEl.classList.add('cloud');
        } else if (current.weather_code >= 61) {
            heroPanelEl.classList.add('rain');
        }

        // --- UPDATE THE UI ---
        cityNameEl.innerText = cityName;
        mainTempEl.innerText = `${Math.round(current.temperature_2m)}°`;
        mainConditionEl.innerText = condition.text;
        mainIconEl.className = `weather-icon fa-solid ${condition.icon}`;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dayStr = dayNames[now.getDay()];
        const dateStr = now.toLocaleDateString([], { day: '2-digit', month: 'short' });
        const yearStr = now.toLocaleDateString([], { year: '2-digit' });
        localTimeEl.innerText = `${timeStr} - ${dayStr}, ${dateStr} '${yearStr}`;

        cloudDetailEl.innerText = `${current.cloud_cover}%`;
        humidDetailEl.innerText = `${current.relative_humidity_2m}%`;
        windDetailEl.innerText = `${Math.round(current.wind_speed_10m)}km/h`;
        rainDetailEl.innerText = `${current.precipitation}mm`;

    } catch (err) {
        console.error("Error fetching weather:", err);
    }
}

// Event Listeners
document.getElementById('searchBtn').addEventListener('click', () => {
    searchCity(searchInputEl.value);
});

searchInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCity(searchInputEl.value);
    }
});

initiateApp();