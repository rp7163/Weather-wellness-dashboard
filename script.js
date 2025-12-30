lucide.createIcons();

const API_KEY = "e52a357d981a00e0b9e4fbd01b8440b9";
const AQICN_TOKEN = "60431cbeff909d42e27a8d8d02614341effb36ec";
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const famousCities = [
    "Mumbai, IN", "Delhi, IN", "Bangalore, IN", "Hyderabad, IN", "Ahmedabad, IN",
    "Chennai, IN", "Kolkata, IN", "Surat, IN", "Pune, IN", "Jaipur, IN", "Noida, IN", "Jammu, IN",
    "London, GB", "New York, US", "Tokyo, JP", "Paris, FR", "Dubai, AE", "Toronto, CA"
];

const $ = (id) => document.getElementById(id);
const elements = {
    citySearch: $('city-search'),
    suggestionsList: $('suggestions-list'),
    locationBtn: $('location-btn'),
    errorMessage: $('error-message'),
    cityName: $('city-name'),
    dateTime: $('date-time'),
    currentTemp: $('current-temp'),
    feelsLike: $('feels-like'),
    mainIconContainer: $('main-icon-container'),
    weatherDescription: $('weather-description'),
    humidity: $('humidity'),
    windSpeed: $('wind-speed'),
    sunriseTime: $('sunrise-time'),
    sunsetTime: $('sunset-time'),
    aqiIndex: $('aqi-index'),
    pressure: $('pressure'),
    hourlyForecast: $('hourly-forecast'),
    dailyForecast: $('daily-forecast'),
    wwsProgress: $('wws-progress'),
    wwsStatus: $('wws-status'),
    currentWeatherCard: $('current-weather'),
    searchContainer: $('search-container'),
    notFoundBox: $('not-found-box')
};

const getAiIcon = (code) => {
    const prefix = "https://cdn.jsdelivr.net/gh/basmilius/weather-icons@dev/production/fill/svg/";
    const map = {
        "01d": "clear-day.svg", "01n": "clear-night.svg",
        "02d": "partly-cloudy-day.svg", "02n": "partly-cloudy-night.svg",
        "03d": "cloudy.svg", "03n": "cloudy.svg",
        "04d": "overcast.svg", "04n": "overcast.svg",
        "09d": "rain.svg", "09n": "rain.svg",
        "10d": "partly-cloudy-day-rain.svg", "10n": "partly-cloudy-night-rain.svg",
        "11d": "thunderstorms-day.svg", "11n": "thunderstorms-night.svg",
        "13d": "snow.svg", "13n": "snow.svg",
        "50d": "mist.svg", "50n": "mist.svg"
    };
    return prefix + (map[code] || "clear-day.svg");
};

const updateAutoTheme = (sunrise, sunset) => {
  const now = Math.floor(Date.now() / 1000);
  const isNight = now < sunrise || now > sunset;
  const body = $("app-body");
  body.classList.toggle("bg-gray-900", isNight);
  body.classList.toggle("text-white", isNight);
  body.classList.toggle("bg-blue-50", !isNight);
  body.classList.toggle("text-gray-900", !isNight);
};

const updateAQIUI = (aqi) => {
  elements.aqiIndex.textContent = aqi || "N/A";
  let status = "Good",
    color = "#10b981",
    percent = (aqi / 300) * 100;

  if (aqi > 300) {
    status = "Hazardous";
    color = "#7e0023";
  } else if (aqi > 200) {
    status = "Very Unhealthy";
    color = "#660099";
  } else if (aqi > 150) {
    status = "Unhealthy";
    color = "#cc0033";
  } else if (aqi > 100) {
    status = "Sensitive Group";
    color = "#ff9933";
  } else if (aqi > 50) {
    status = "Moderate";
    color = "#ffde33";
  }

  elements.wwsProgress.style.width = `${Math.min(100, percent || 0)}%`;
  elements.wwsProgress.style.backgroundColor = color;
  elements.wwsStatus.textContent = status;
  elements.wwsStatus.style.color = color;
};

const getLocalTime = (timezoneOffset) => {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTime = new Date(utcTime + timezoneOffset * 1000);
  return localTime.toLocaleString([], {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchWeather = async (
  query = "Ahmedabad",
  isCity = true,
  lat = null,
  lon = null
) => {
  try {
    elements.errorMessage.classList.add("hidden");
    elements.notFoundBox.classList.add("hidden");
    let url = isCity
      ? `${API_BASE_URL}weather?q=${query}&units=metric&appid=${API_KEY}`
      : `${API_BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("City Not Found");
    const weatherData = await res.json();

    const aqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${weatherData.coord.lat};${weatherData.coord.lon}/?token=${AQICN_TOKEN}`
    );
    const aqiData = await aqiRes.json();
    updateAQIUI(aqiData.status === "ok" ? aqiData.data.aqi : 0);

    const fRes = await fetch(
      `${API_BASE_URL}forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await fRes.json();

    updateUI(weatherData, forecastData);
    updateAutoTheme(weatherData.sys.sunrise, weatherData.sys.sunset);
    elements.citySearch.value = "";
  } catch (e) {
    elements.errorMessage.classList.remove("hidden");
    elements.notFoundBox.classList.remove("hidden");
  }
};

const updateUI = (current, forecast) => {
  elements.cityName.textContent = `${current.name}, ${current.sys.country}`;
  elements.dateTime.textContent = getLocalTime(current.timezone);
  elements.currentTemp.textContent = `${Math.round(current.main.temp)}°C`;
  elements.feelsLike.textContent = `Feels like ${Math.round(
    current.main.feels_like
  )}°C`;
  elements.mainIconContainer.innerHTML = `<img src="${getAiIcon(
    current.weather[0].icon
  )}" class="w-full h-full object-contain" alt="Weather">`;
  elements.weatherDescription.textContent = current.weather[0].description;

  const id = current.weather[0].id;
  elements.currentWeatherCard.style.background =
    id === 800
      ? "linear-gradient(135deg, #FFD200, #F7971E)"
      : "linear-gradient(135deg, #00B4DB, #0083B0)";

  elements.humidity.textContent = `${current.main.humidity}%`;
  elements.windSpeed.textContent = `${(current.wind.speed * 3.6).toFixed(
    1
  )} km/h`;

  const simpleFormat = (ts) => {
    const d = new Date((ts + current.timezone) * 1000);
    return (
      d.getUTCHours().toString().padStart(2, "0") +
      ":" +
      d.getUTCMinutes().toString().padStart(2, "0")
    );
  };
  elements.sunriseTime.textContent = simpleFormat(current.sys.sunrise);
  elements.sunsetTime.textContent = simpleFormat(current.sys.sunset);
  elements.pressure.textContent = `${current.main.pressure} hPa`;

  elements.hourlyForecast.innerHTML = forecast.list
    .slice(0, 8)
    .map((h) => {
      const hDate = new Date((h.dt + current.timezone) * 1000);
      const timeStr = hDate.getUTCHours().toString().padStart(2, "0") + ":00";
      return `<div class="flex flex-col items-center p-3 rounded-xl bg-white/80 dark:bg-white/10 flex-shrink-0 min-w-[100px] shadow-md border border-black/5">
            <p class="text-md font-medium">${timeStr}</p>
            <img class="w-12 h-12 my-1" src="${getAiIcon(h.weather[0].icon)}">
            <p class="font-bold text-md">${Math.round(h.main.temp)}°</p>
        </div>`;
    })
    .join("");

  const dailyData = {};
  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyData[date]) {
      dailyData[date] = {
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        dt: item.dt,
      };
    } else {
      dailyData[date].temp_max = Math.max(
        dailyData[date].temp_max,
        item.main.temp_max
      );
      dailyData[date].temp_min = Math.min(
        dailyData[date].temp_min,
        item.main.temp_min
      );
    }
  });

  elements.dailyForecast.innerHTML = Object.values(dailyData)
    .slice(0, 5)
    .map(
      (d) => `
        <div class="grid grid-cols-4 items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 transition shadow-sm border border-black/5 text-md">
            <p class="font-bold text-md">${new Date(
              d.dt * 1000
            ).toLocaleDateString([], { weekday: "short", day: "numeric" })}</p>
            <div class="flex justify-end"><img class="w-10 h-10" src="${getAiIcon(
              d.icon
            )}"></div>
            <p class="text-md capitalize opacity-80 text-center">${
              d.description
            }</p>
            <p class="font-semibold text-right text-md">${Math.round(
              d.temp_min
            )}° / ${Math.round(d.temp_max)}°</p>
        </div>`
    )
    .join("");
  lucide.createIcons();
};

elements.citySearch.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (query.length < 1) {
    elements.suggestionsList.classList.add("hidden");
    return;
  }
  const filtered = famousCities
    .filter((c) => c.toLowerCase().includes(query))
    .slice(0, 10);
  elements.suggestionsList.innerHTML = "";
  if (filtered.length > 0) {
    filtered.forEach((city) => {
      const li = document.createElement("li");
      li.className =
        "p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 text-gray-900 font-medium";
      li.textContent = city;
      li.onclick = () => {
        fetchWeather(city);
        elements.suggestionsList.classList.add("hidden");
      };
      elements.suggestionsList.appendChild(li);
    });
    elements.suggestionsList.classList.remove("hidden");
  } else {
    elements.suggestionsList.classList.add("hidden");
  }
});

elements.citySearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const val = elements.citySearch.value.trim();
    if (val) {
      fetchWeather(val);
      elements.suggestionsList.classList.add("hidden");
    }
  }
});

document.addEventListener("click", (e) => {
  if (!elements.searchContainer.contains(e.target)) {
    elements.suggestionsList.classList.add("hidden");
  }
});

elements.locationBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
    (p) => fetchWeather(null, false, p.coords.latitude, p.coords.longitude),
    () => fetchWeather()
  );
};

document.addEventListener("DOMContentLoaded", () => fetchWeather());