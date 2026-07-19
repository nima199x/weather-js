var cityInput = document.getElementById("cityInput");
var addInput = document.getElementById("add");
var cityOutput = document.getElementById("cityoutput");
var descOutput = document.getElementById("description");
var tempOutput = document.getElementById("temp");
var windOutput = document.getElementById("wind");
var humidityOutput = document.getElementById("humidity");
var pressureOutput = document.getElementById("pressure");
var iconOutput = document.getElementById("weatherIcon");
var errorOutput = document.getElementById("errorMsg");
var wrapper = document.querySelector(".wrapper");
var forecastContainer = document.getElementById("forecast");
var weatherBg = document.getElementById("weatherBg");

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// WMO weather codes returned by Open-Meteo
const weatherCodeMap = {
  0:  { desc: "Clear sky",             group: "clear",  emoji: "☀️" },
  1:  { desc: "Mainly clear",          group: "clear",  emoji: "🌤️" },
  2:  { desc: "Partly cloudy",         group: "clouds", emoji: "⛅" },
  3:  { desc: "Overcast",              group: "clouds", emoji: "☁️" },
  45: { desc: "Fog",                   group: "clouds", emoji: "🌫️" },
  48: { desc: "Depositing rime fog",   group: "clouds", emoji: "🌫️" },
  51: { desc: "Light drizzle",         group: "rain",   emoji: "🌦️" },
  53: { desc: "Moderate drizzle",      group: "rain",   emoji: "🌦️" },
  55: { desc: "Dense drizzle",         group: "rain",   emoji: "🌧️" },
  56: { desc: "Light freezing drizzle",group: "rain",   emoji: "🌧️" },
  57: { desc: "Dense freezing drizzle",group: "rain",   emoji: "🌧️" },
  61: { desc: "Slight rain",           group: "rain",   emoji: "🌧️" },
  63: { desc: "Moderate rain",         group: "rain",   emoji: "🌧️" },
  65: { desc: "Heavy rain",            group: "rain",   emoji: "🌧️" },
  66: { desc: "Light freezing rain",   group: "rain",   emoji: "🌧️" },
  67: { desc: "Heavy freezing rain",   group: "rain",   emoji: "🌧️" },
  71: { desc: "Slight snow fall",      group: "snow",   emoji: "🌨️" },
  73: { desc: "Moderate snow fall",    group: "snow",   emoji: "❄️" },
  75: { desc: "Heavy snow fall",       group: "snow",   emoji: "❄️" },
  77: { desc: "Snow grains",           group: "snow",   emoji: "❄️" },
  80: { desc: "Slight rain showers",   group: "rain",   emoji: "🌦️" },
  81: { desc: "Moderate rain showers", group: "rain",   emoji: "🌧️" },
  82: { desc: "Violent rain showers",  group: "rain",   emoji: "⛈️" },
  85: { desc: "Slight snow showers",   group: "snow",   emoji: "🌨️" },
  86: { desc: "Heavy snow showers",    group: "snow",   emoji: "❄️" },
  95: { desc: "Thunderstorm",          group: "thunder", emoji: "⛈️" },
  96: { desc: "Thunderstorm, slight hail", group: "thunder", emoji: "⛈️" },
  99: { desc: "Thunderstorm, heavy hail",  group: "thunder", emoji: "⛈️" },
};

function getWeatherInfo(code) {
  return weatherCodeMap[code] || { desc: "Unknown", group: "clouds", emoji: "☁️" };
}

function showError(message) {
  clearOutputs();
  errorOutput.innerHTML = message;
  wrapper.classList.add("has-error");
}

function clearOutputs() {
  errorOutput.innerHTML = "";
  wrapper.classList.remove("has-error");
  cityOutput.innerHTML = "";
  descOutput.innerHTML = "";
  tempOutput.innerHTML = "";
  windOutput.innerHTML = "";
  humidityOutput.innerHTML = "";
  pressureOutput.innerHTML = "";
  iconOutput.innerHTML = "";
  forecastContainer.innerHTML = "";
}

function setLoading() {
  clearOutputs();
  cityOutput.innerHTML = "Loading weather data...";
}

function isPersianText(text) {
  return /[\u0600-\u06FF]/.test(text);
}

async function geocodeCity(city) {
  var lang = isPersianText(city) ? "fa,en" : "en";
  var res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&accept-language=${lang}`
  );
  if (!res.ok) throw { type: "geo", status: res.status };
  var data = await res.json();
  if (!data.length) throw { type: "notfound" };
  var place = data[0];
  var shortName = place.display_name.split(",")[0].trim();
  return { lat: parseFloat(place.lat), lon: parseFloat(place.lon), name: shortName };
}

async function getForecast(lat, lon) {
  var res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
  );
  if (!res.ok) throw { type: "forecast", status: res.status };
  return await res.json();
}

async function GetWeather() {
  var city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name");
    return;
  }

  setLoading();

  try {
    var place = await geocodeCity(city);
    var data = await getForecast(place.lat, place.lon);
    setInfo(place.name, data);
  } catch (err) {
    if (err.type === "notfound") {
      showError("City not found. Please check the spelling and try again");
    } else {
      showError("Something went wrong while fetching the data. Please try again");
    }
  }
}

function setBackground(group) {
  weatherBg.className = "weather-bg " + group;
  weatherBg.innerHTML = "";

  if (group === "rain" || group === "thunder") {
    for (var i = 0; i < 60; i++) {
      var drop = document.createElement("div");
      drop.className = "raindrop";
      drop.style.left = Math.random() * 100 + "%";
      drop.style.animationDuration = (0.4 + Math.random() * 0.4) + "s";
      drop.style.animationDelay = Math.random() * 2 + "s";
      weatherBg.appendChild(drop);
    }
  } else if (group === "snow") {
    for (var i = 0; i < 45; i++) {
      var flake = document.createElement("div");
      flake.className = "snowflake";
      flake.style.left = Math.random() * 100 + "%";
      flake.style.animationDuration = (4 + Math.random() * 4) + "s";
      flake.style.animationDelay = Math.random() * 5 + "s";
      flake.style.opacity = 0.4 + Math.random() * 0.6;
      weatherBg.appendChild(flake);
    }
  } else if (group === "clouds") {
    for (var i = 0; i < 5; i++) {
      var cloud = document.createElement("div");
      cloud.className = "float-cloud";
      cloud.style.top = (5 + Math.random() * 40) + "%";
      cloud.style.animationDuration = (25 + Math.random() * 20) + "s";
      cloud.style.animationDelay = (Math.random() * 20) + "s";
      cloud.style.transform = "scale(" + (0.6 + Math.random() * 0.8) + ")";
      weatherBg.appendChild(cloud);
    }
  }
}

function setInfo(cityName, data) {
  clearOutputs();

  var current = data.current;
  var info = getWeatherInfo(current.weather_code);

  iconOutput.innerHTML = `<span class="emoji-icon">${info.emoji}</span>`;
  cityOutput.innerHTML = `City : ${cityName}`;
  descOutput.innerHTML = `Description : ${info.desc}`;
  tempOutput.innerHTML = `Temperature : ${current.temperature_2m.toFixed(1)} °C`;
  windOutput.innerHTML = `Wind Speed : ${current.wind_speed_10m.toFixed(2)} km/h`;
  humidityOutput.innerHTML = `Humidity : ${current.relative_humidity_2m}%`;
  pressureOutput.innerHTML = `Pressure : ${Math.round(current.surface_pressure)} hPa`;

  setBackground(info.group);
  renderForecast(data.daily);
}

function renderForecast(daily) {
  forecastContainer.innerHTML = "";

  for (var i = 0; i < daily.time.length; i++) {
    var date = new Date(daily.time[i]);
    var dayName = weekDays[date.getDay()];
    var dateStr = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    var info = getWeatherInfo(daily.weather_code[i]);
    var max = Math.round(daily.temperature_2m_max[i]);
    var min = Math.round(daily.temperature_2m_min[i]);

    var card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="forecast-day">${dayName}</p>
      <p class="forecast-date">${dateStr}</p>
      <span class="forecast-emoji">${info.emoji}</span>
      <p class="forecast-temp">${max}° / ${min}°</p>
      <p class="forecast-desc">${info.desc}</p>
    `;
    forecastContainer.appendChild(card);
  }
}

addInput.addEventListener("click", GetWeather);

cityInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    GetWeather();
  }
});