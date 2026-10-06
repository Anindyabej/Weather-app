const API_KEY = "8fcbe7030db827ca9e0cd8a8da410788";

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const errorMessage = document.querySelector("#error-message");
const weatherInfo = document.querySelector("#weather-info");

const cityName = document.querySelector("#city-name");
const dateEl = document.querySelector("#date");
const temperature = document.querySelector("#temperature");
const condition = document.querySelector("#condition");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const feelsLike = document.querySelector("#feels-like");
const weatherImage = document.querySelector("#weather-image");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();
  hideError();

  if (!city) {
    weatherInfo.hidden = true;
    showError("Please enter a city name.");
    return;
  }

  getWeather(city);
});

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (String(data.cod) === "404") {
        throw new Error("City not found. Check the spelling and try again.");
      }
      throw new Error(data.message || "Could not get the weather right now.");
    }

    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateEl.textContent = formatLocalDate(data.dt, data.timezone);
    temperature.textContent = Math.round(data.main.temp);
    condition.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    // The API returns metres per second when units=metric
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    setWeatherImage(data.weather[0].main, data.weather[0].description);
    weatherInfo.hidden = false;
  } catch (error) {
    weatherInfo.hidden = true;
    const offline = error instanceof TypeError;
    showError(offline ? "Can't reach the weather service. Check your connection." : error.message);
  }
}

// Shows the date in the searched city's own time zone
function formatLocalDate(unixSeconds, offsetSeconds) {
  const local = new Date((unixSeconds + offsetSeconds) * 1000);
  return local.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function setWeatherImage(main, description) {
  const images = {
    Clear: "clear.png",
    Clouds: /few|scattered/.test(description) ? "humidity.png" : "clouds.png",
    Rain: "drizzle.png",
    Drizzle: "drizzle.png",
    Thunderstorm: "drizzle.png",
    Snow: "snow.png",
    Mist: "mist.png",
    Fog: "mist.png",
    Haze: "mist.png",
    Smoke: "mist.png",
    Dust: "mist.png",
    Sand: "mist.png",
  };
  weatherImage.src = `images/${images[main] || "clouds.png"}`;
  weatherImage.alt = description;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  errorMessage.hidden = true;
}