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

const apiKey = API_KEY; // مقدار واقعی از فایل config.js می‌آید


function convertToCel(value) {
  return (value - 273.15).toFixed(2);
}

function convertWindToKmh(speedMps) {
  return (speedMps * 3.6).toFixed(2);
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
}

function setLoading() {
  clearOutputs();
  cityOutput.innerHTML = "در حال دریافت اطلاعات...";
}

async function GetWeather() {
  var city = cityInput.value.trim();

  if (city === "") {
    showError("لطفاً نام شهر را وارد کنید");
    return;
  }

  setLoading();

  try {
    var response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        showError("شهری با این نام پیدا نشد. لطفاً نام را به انگلیسی وارد کنید");
      } else if (response.status === 401) {
        showError("خطا در کلید API. لطفاً بعداً دوباره امتحان کنید");
      } else {
        showError("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید");
      }
      return;
    }

    var weatherResult = await response.json();
    setInfo(weatherResult);
  } catch (err) {
    showError("مشکلی در اتصال به اینترنت پیش آمد. لطفاً اتصال خود را بررسی کنید");
  }
}

function setInfo(data) {
  clearOutputs();

  var cityName = data["name"];
  var description = data["weather"][0]["description"];
  var iconCode = data["weather"][0]["icon"];
  var temp = data["main"]["temp"];
  var humidity = data["main"]["humidity"];
  var pressure = data["main"]["pressure"];
  var wind = data["wind"]["speed"];

  iconOutput.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">`;
  cityOutput.innerHTML = `City : ${cityName}`;
  descOutput.innerHTML = `Description : ${description}`;
  tempOutput.innerHTML = `Temprature : ${convertToCel(temp)} °C`;
  windOutput.innerHTML = `Wind Speed : ${convertWindToKmh(wind)} km/h`;
  humidityOutput.innerHTML = `Humidity : ${humidity}%`;
  pressureOutput.innerHTML = `Pressure : ${pressure} hPa`;
}

addInput.addEventListener("click", GetWeather);

cityInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    GetWeather();
  }
});
