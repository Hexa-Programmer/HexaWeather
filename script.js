// script.js

const search = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");
const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const forecastEl = document.getElementById("forecast");
const recentEl = document.getElementById("recent");
const appContainer = document.getElementById("appContainer");

let currentCity = null;
let recent = JSON.parse(localStorage.getItem("hexa_weather_recent") || "[]");

function saveRecent(city) {
    recent = [city, ...recent.filter(c => c !== city)].slice(0, 10);
    localStorage.setItem("hexa_weather_recent", JSON.stringify(recent));
    renderRecent();
}

function renderRecent() {
    recentEl.innerHTML = "";
    
    recent.forEach(city => {
        const div = document.createElement("div");
        div.innerText = city;
        div.classList.add("recent-item");
        
        if (city === currentCity) {
            div.classList.add("active");
        }
        
        div.onclick = () => {
            search.value = "";
            suggestionsBox.classList.remove('show');
            getWeather(city, true);
        };
        
        recentEl.appendChild(div);
    });
}

let debounceTimeout;

search.addEventListener("input", (e) => {
    clearTimeout(debounceTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        suggestionsBox.classList.remove('show');
        return;
    }

    debounceTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                renderSuggestions(data.results);
            } else {
                suggestionsBox.classList.remove('show');
            }
        } catch (err) {
            console.error("Failed to fetch suggestions");
        }
    }, 50); 
});

function renderSuggestions(results) {
    suggestionsBox.innerHTML = "";
    results.forEach(loc => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        

        const details = [loc.name, loc.admin1, loc.country].filter(Boolean).join(", ");
        div.innerText = details;
        
        div.onclick = () => {
            search.value = "";
            suggestionsBox.classList.remove('show');
            getWeather(loc.name, true);
        };
        
        suggestionsBox.appendChild(div);
    });
    suggestionsBox.classList.add('show');
}


document.addEventListener("click", (e) => {
    if (!search.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove('show');
    }
});

search.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && search.value.trim() !== "") {
        suggestionsBox.classList.remove('show');
        getWeather(search.value, true);
        search.value = ""; 
    }
});

async function getCoords(city) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        const data = await res.json();
        if (!data.results) return null;
        return data.results[0];
    } catch (e) {
        return null;
    }
}

async function getWeather(city, isUserAction = false) {
    cityEl.textContent = "Loading...";
    tempEl.textContent = "--°C";
    descEl.textContent = "Fetching weather data...";
    document.getElementById("weatherIcon").textContent = "✨";
    document.getElementById("weatherIcon").className = "weather-icon animate-pulse";
    
    const loc = await getCoords(city);
    
    if (!loc) {
        cityEl.textContent = "Not found";
        tempEl.textContent = "--";
        descEl.textContent = "Please try another location.";
        document.getElementById("weatherIcon").textContent = "❓";
        return;
    }

    currentCity = loc.name;
    saveRecent(loc.name);

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${loc.latitude}&longitude=${loc.longitude}` +
        `&current_weather=true&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const current = data.current_weather;


        if (current.is_day === 1) {
            document.body.className = 'theme-day';
        } else {
            document.body.className = 'theme-night';
        }

        cityEl.textContent = `${loc.name}, ${loc.country}`;
        tempEl.textContent = `${Math.round(current.temperature)}°C`;
        
        const weatherDetails = getWeatherDetails(current.weathercode, current.is_day);
        descEl.textContent = `${weatherDetails.text} • Wind: ${current.windspeed} km/h`;
        
        const iconEl = document.getElementById("weatherIcon");
        iconEl.textContent = weatherDetails.emoji;
        iconEl.className = `weather-icon ${weatherDetails.animation}`;

        renderForecast(data.daily);

        if (isUserAction && window.innerWidth <= 768) {
            appContainer.classList.add('weather-open');
        }
    } catch (e) {
        descEl.textContent = "Failed to load weather data.";
    }
}

function getWeatherDetails(code, isDay) {
    const sunMoon = isDay ? "☀️" : "🌙";
    const cloudMoon = isDay ? "⛅" : "☁️";

    if (code === 0) return { emoji: sunMoon, animation: isDay ? "animate-spin" : "animate-float", text: "Clear Sky" };
    if (code > 0 && code <= 3) return { emoji: cloudMoon, animation: "animate-float", text: "Partly Cloudy" };
    if (code === 45 || code === 48) return { emoji: "🌕", animation: "animate-float", text: "Foggy" };
    if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) 
        return { emoji: "🌧️", animation: "animate-float", text: "Rainy" };
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) 
        return { emoji: "❄️", animation: "animate-float", text: "Snowy" };
    if (code >= 95 && code <= 99) return { emoji: "⛈️", animation: "animate-pulse", text: "Thunderstorms" };
    
    return { emoji: "🌤️", animation: "animate-float", text: "Unknown" };
}

function renderForecast(daily) {
    forecastEl.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {
        if(i === 0 || i > 5) continue; 
        
        const div = document.createElement("div");
        div.className = "forecast-day";
        
        const dateStr = daily.time[i].slice(5);

        div.innerHTML = `
            <div>${dateStr}</div>
            <div>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</div>
        `;

        forecastEl.appendChild(div);
    }
}

function closeWeather() {
    appContainer.classList.remove('weather-open');
}

function clearHistory() {
    if (!confirm("Are you sure you want to clear your recent searches?")) return;
    
    recent = [];
    localStorage.removeItem("hexa_weather_recent");
    renderRecent();
    
    if (window.innerWidth <= 768) {
        closeWeather();
    }
}

function init() {

    const hour = new Date().getHours();
    document.body.className = (hour >= 6 && hour < 18) ? 'theme-day' : 'theme-night';

    renderRecent();
    
    if (recent.length > 0) {
        getWeather(recent[0], false);
    } else {
        getWeather("London", false);
    }

    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hide-loader');
    }, 2200);
}

init();