const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // Free OpenWeather API key
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('errorMsg');
const weatherCard = document.getElementById('weatherCard');

const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const tempEl = document.getElementById('temp');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const favBtn = document.getElementById('favBtn');
const favoritesList = document.getElementById('favoritesList');

let currentCityData = null;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

renderFavorites();

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    weatherCard.classList.add('hidden');
    errorDiv.classList.add('hidden');
    cityInput.focus();
});

async function fetchWeather(city) {
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    weatherCard.classList.add('hidden');

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
        const data = await response.json();

        loadingDiv.classList.add('hidden');

        if (response.ok) {
            currentCityData = {
                name: data.name,
                country: data.sys.country,
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed
            };
            displayWeather(currentCityData);
        } else {
            errorDiv.textContent = data.message || 'City not found. Please try again.';
            errorDiv.errorDiv?.classList.remove('hidden'); // safe fallback
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        loadingDiv.classList.add('hidden');
        errorDiv.textContent = 'Network error. Please check your connection.';
        errorDiv.classList.remove('hidden');
    }
}

function displayWeather(data) {
    cityNameEl.textContent = `${data.name}, ${data.country}`;
    tempEl.textContent = `${data.temp}°C`;
    descriptionEl.textContent = data.description;
    humidityEl.textContent = `${data.humidity}%`;
    windSpeedEl.textContent = `${data.windSpeed} km/h`;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    
    weatherCard.classList.remove('hidden');
}

favBtn.addEventListener('click', () => {
    if (!currentCityData) return;
    
    const cityName = currentCityData.name;
    if (!favorites.includes(cityName)) {
        favorites.push(cityName);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        renderFavorites();
    }
});

window.removeFavorite = function(cityName) {
    favorites = favorites.filter(fav => fav !== cityName);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
};

window.searchFavorite = function(cityName) {
    cityInput.value = cityName;
    fetchWeather(cityName);
};

function renderFavorites() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="font-size:12px; color:#94a3b8;">No favorite cities saved yet.</p>';
        return;
    }

    favorites.forEach(cityName => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="cursor:pointer; color:#38bdf8;" onclick="searchFavorite('${cityName}')">${cityName}</span>
            <button onclick="removeFavorite('${cityName}')">Remove</button>
        `;
        favoritesList.appendChild(li);
    });
}