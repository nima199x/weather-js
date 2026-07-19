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

const persianDays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

// نگاشت کدهای هواشناسی WMO که Open-Meteo برمی‌گرداند
const weatherCodeMap = {
  0:  { desc: "آسمان صاف",              group: "clear",  emoji: "☀️" },
  1:  { desc: "عمدتاً صاف",              group: "clear",  emoji: "🌤️" },
  2:  { desc: "نیمه‌ابری",               group: "clouds", emoji: "⛅" },
  3:  { desc: "ابری",                    group: "clouds", emoji: "☁️" },
  45: { desc: "مه",                      group: "clouds", emoji: "🌫️" },
  48: { desc: "مه یخ‌زده",               group: "clouds", emoji: "🌫️" },
  51: { desc: "نم‌نم باران سبک",          group: "rain",   emoji: "🌦️" },
  53: { desc: "نم‌نم باران متوسط",        group: "rain",   emoji: "🌦️" },
  55: { desc: "نم‌نم باران شدید",         group: "rain",   emoji: "🌧️" },
  56: { desc: "نم‌نم باران یخ‌زده سبک",   group: "rain",   emoji: "🌧️" },
  57: { desc: "نم‌نم باران یخ‌زده شدید",  group: "rain",   emoji: "🌧️" },
  61: { desc: "باران سبک",               group: "rain",   emoji: "🌧️" },
  63: { desc: "باران متوسط",             group: "rain",   emoji: "🌧️" },
  65: { desc: "باران شدید",              group: "rain",   emoji: "🌧️" },
  66: { desc: "باران یخ‌زده سبک",        group: "rain",   emoji: "🌧️" },
  67: { desc: "باران یخ‌زده شدید",       group: "rain",   emoji: "🌧️" },
  71: { desc: "برف سبک",                 group: "snow",   emoji: "🌨️" },
  73: { desc: "برف متوسط",               group: "snow",   emoji: "❄️" },
  75: { desc: "برف شدید",                group: "snow",   emoji: "❄️" },
  77: { desc: "دانه‌های برف",             group: "snow",   emoji: "❄️" },
  80: { desc: "رگبار باران سبک",         group: "rain",   emoji: "🌦️" },
  81: { desc: "رگبار باران متوسط",       group: "rain",   emoji: "🌧️" },
  82: { desc: "رگبار باران شدید",        group: "rain",   emoji: "⛈️" },
  85: { desc: "رگبار برف سبک",           group: "snow",   emoji: "🌨️" },
  86: { desc: "رگبار برف شدید",          group: "snow",   emoji: "❄️" },
  95: { desc: "رعد و برق",               group: "thunder", emoji: "⛈️" },
  96: { desc: "رعد و برق با تگرگ سبک",   group: "thunder", emoji: "⛈️" },
  99: { desc: "رعد و برق با تگرگ شدید",  group: "thunder", emoji: "⛈️" },
};

function getWeatherInfo(code) {
  return weatherCodeMap[code] || { desc: "نامشخص", group: "clouds", emoji: "☁️" };
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
  cityOutput.innerHTML = "در حال دریافت اطلاعات...";
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
    showError("لطفاً نام شهر را وارد کنید");
    return;
  }

  setLoading();

  try {
    var place = await geocodeCity(city);
    var data = await getForecast(place.lat, place.lon);
    setInfo(place.name, data);
  } catch (err) {
    if (err.type === "notfound") {
      showError("شهری با این نام پیدا نشد. برای نتیجه‌ی بهتر، نام شهر را به انگلیسی وارد کنید");
    } else {
      showError("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید");
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
  tempOutput.innerHTML = `Temprature : ${current.temperature_2m.toFixed(1)} °C`;
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
    var dayName = persianDays[date.getDay()];
    var dateStr = date.toLocaleDateString("fa-IR", { day: "numeric", month: "long" });
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