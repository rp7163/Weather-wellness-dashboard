# 🌦️ Weather Wellness Dashboard

A simple, clean weather app that goes a step beyond just showing temperature. It focuses on daily wellness by keeping air quality (AQI) front and center and automatically switching its look based on whether it’s day or night in the selected location.

## 🔗 Live App
- **Production:** https://weather-wellness-dashboard.vercel.app/
  
## Why I built this
Most weather apps feel cluttered or hide important info like air quality. I wanted something that:
1. Clearly shows if it’s a good day to go outside (AQI matters).
2. Automatically switches to a night theme after sunset in your city.
3. Loads fast, looks clean, and works well on mobile.

## 🛠 What’s under the hood
- **Core:** HTML, Tailwind CSS, Vanilla JavaScript
- **Weather Data:** OpenWeatherMap API
- **Air Quality:** WAQI (AQICN) API
- **Icons:** Lucide icons and weather SVGs

## 🚀 Running locally
1. Clone the repository  
2. Get a free API key from:
   - https://openweathermap.org/
   - https://aqicn.org/api/
3. Add your keys to the constants at the top of `script.js`
4. Open `index.html` in your browser

No build tools or frameworks needed.

## 📸 UI & behavior
- Dynamic background gradients based on weather conditions
- Automatic dark mode after sunset at the searched location
- Clean layout focused on readability and everyday use

---

Feel free to fork the project or use the code in your own apps.
