Link: https://ipvikas.github.io/VikCITY/
# Know the Weather: PRD

## Problem
Weather apps show lots of numbers, but I just want to know one thing: **"What should I wear today?"** I don't want to dig through menus or sign up for anything.

## Who it's for
Anyone who checks the weather before leaving home: commuters, students, travellers. No technical skill needed.

## What it does (one sentence)
You type a city and get today's weather, a 7-day forecast and plain-English advice on what to wear.

## Features

### Version 1 (smallest useful thing)
- **F1.** Type a city name, press Enter or a Search button, and the app finds it.
- **F2.** Show current temperature (°C) and "feels like".
- **F3.** Show a short description with an emoji (e.g. "☀️ Clear sky").
- **F4.** Show outfit advice following the "Outfit rules" section below (clothing from "feels like", plus umbrella, boots and windbreaker extras).
- **F5.** Friendly messages when something goes wrong (city not found, no internet, API down).

### Version 2 (the full day and week)
- **F6.** Show humidity, wind speed and today's chance of rain.
- **F7.** Show today's sky label (Clear, Cloudy, Rainy, Windy, etc.) with today's minimum and maximum temperature.
- **F8.** Change the page background to match the sky: Clear, Cloudy, Dusty, Windy or Rainy (also Snowy and Foggy).
- **F9.** 7-day forecast: each day shows its low and high, with an emoji.
- **F10.** °C / °F switch that updates every temperature on screen.
- **F11.** Remember recent cities (last 5) and show them as clickable buttons.

### Version 3 (more detail and comparing)
- **F12.** Wind speed unit switch: km/h, m/s, mph.
- **F13.** Atmospheric pressure with a unit switch: atm or mbar.
- **F14.** A "+" button adds another city; cities sit side by side so every field can be compared.
- **F15.** Remove a city from the comparison.

### Version 4 (local extras)
- **F16.** Live local time of the searched city with its time zone, e.g. "4:30 PM IST – India Standard Time".
- **F17.** "What to wear" appears in the browser's language (English if the language is not supported).
- **F18.** Up to 5 places to visit, most popular first, each with a 1-2 line description.
- **F19.** The country's currency with the latest USD rate, e.g. "INR (₹), 1 USD = ₹…", refreshed automatically.

## Data
- Source: **Open-Meteo** (free, no key needed). Two calls:
  1. *Geocoding API*: turns a city name into latitude and longitude.
     `https://geocoding-api.open-meteo.com/v1/search?name=London&count=1`
  2. *Forecast API*: gives current temperature, feels like, humidity, wind, pressure, weather code, and daily min/max temperature and rain chance for 7 days.
     `https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=7&timezone=auto`
- Weather codes from Open-Meteo are turned into our labels and emojis. "Windy" is worked out from wind speed.

- Dusty: Open-Meteo's air quality API (`https://air-quality-api.open-meteo.com/v1/air-quality?current=dust`); dust of 100 µg/m³ or more counts as Dusty.
- V4 free, no-key sources: Wikipedia (places and their reading numbers, `https://en.wikipedia.org/w/api.php`), restcountries.com (currency), open.er-api.com (USD rates, updated daily by the source).
- Pressure arrives in hPa (same as mbar). atm = hPa ÷ 1013.25.
- Saved in the browser (localStorage): recent cities and unit choices. Nothing else is stored.

## Look and feel
- Clean, one centred card on a full-page background that changes with the sky (sunny = bright blue, rainy = grey-blue, night/cloudy = darker).
- Large temperature, big emoji, readable text on any background.
- Works on a phone-width screen as well as a laptop.
- Friendly, short wording. No jargon.

## Tech rules
- Plain HTML, CSS and JavaScript only. No frameworks, no build tools, no installs.
- Three files: `index.html`, `style.css`, `app.js`.
- Opens by double-clicking `index.html`.
- No API key and no backend.
- Every API call handles failure without crashing.

## Outfit rules
The advice combines one **clothing** line (from "feels like"), plus any **extras** below. Round "feels like" to the nearest whole °C first.

| Feels like | Clothing |
|---|---|
| 0°C or below | 🧥 Heavy coat, hat and gloves |
| 1 to 10°C | Warm jacket |
| 11 to 18°C | Light jacket or sweater |
| 19 to 26°C | 👕 T-shirt weather |
| Above 26°C | 🩳 Shorts, sunscreen and water |

**Extras (added on top):**
- ☔ **Umbrella** if today's chance of rain is 50% or more, or it is raining now.
- 🥾 **Waterproof boots** instead of the umbrella if it is snowing.
- 💨 **Windbreaker** if the wind is 30 km/h or more.

Notes: the rules always use °C and km/h behind the scenes, so the °F and wind-unit switches never change the advice. Example: feels like 8°C, 60% rain, wind 35 km/h gives "Warm jacket, ☔ umbrella, 💨 windbreaker".

## Out of scope
Accounts and logins, hourly forecast, maps, weather alerts, notifications, radar, saving a "home" city, languages other than English, and any paid API.

## Done when
1. Typing "London" and pressing Enter shows its current temperature, feels like, and an emoji description. (V1)
2. Typing "asdfgh" or searching with Wi-Fi off shows a friendly message, not a blank screen or error. (V1)
3. A freezing city shows "Heavy coat, hat and gloves", a hot city shows "Shorts, sunscreen and water", and rain or wind adds the ☔ umbrella or 💨 windbreaker. With the browser set to Spanish, the advice is in Spanish. (V1, V4)
4. Humidity, wind, rain chance, today's low/high and 7 forecast days all appear, and the background changes between a sunny and a rainy city. (V2)
5. Clicking °F changes every temperature, and after refreshing, °F and my last cities are still there. (V2)
6. Wind switches between km/h, m/s and mph, and pressure between atm and mbar. (V3)
7. Clicking "+" and adding a second city shows both side by side with all fields; removing one works. (V3)
8. Searching "Mumbai" shows a ticking time like "4:30 PM IST – India Standard Time", INR (₹) with a USD rate, and up to 5 places, each with a short description. (V4)
