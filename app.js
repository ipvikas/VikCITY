// Know the Weather - Version 1
// Plain JavaScript, no libraries. Weather data comes from Open-Meteo (no API key needed).

// ---------- 1. Find the page elements we need ----------
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const messageBox = document.getElementById("message");
const resultBox = document.getElementById("result");
const cityNameEl = document.getElementById("city-name");
const emojiEl = document.getElementById("weather-emoji");
const descriptionEl = document.getElementById("weather-description");
const temperatureEl = document.getElementById("temperature");
const feelsLikeEl = document.getElementById("feels-like");
const outfitList = document.getElementById("outfit-list");
const outfitTitle = document.getElementById("outfit-title");
const clockEl = document.getElementById("local-time");
const currencyEl = document.getElementById("currency");
const placesList = document.getElementById("places-list");

// Timers and a counter so an old search can never overwrite a newer one
let clockTimer, rateTimer, searchId = 0;

// ---------- 2. Turn Open-Meteo's weather code into words and an emoji ----------
// Open-Meteo describes the sky with a number (a "weather code").
function describeWeather(code) {
  if (code === 0) return { text: "Clear sky", emoji: "☀️" };
  if (code === 1) return { text: "Mostly clear", emoji: "🌤️" };
  if (code === 2) return { text: "Partly cloudy", emoji: "⛅" };
  if (code === 3) return { text: "Cloudy", emoji: "☁️" };
  if (code === 45 || code === 48) return { text: "Foggy", emoji: "🌫️" };
  if (code >= 51 && code <= 55) return { text: "Drizzle", emoji: "🌦️" };
  if (code === 56 || code === 57) return { text: "Freezing drizzle", emoji: "🌧️" };
  if (code >= 61 && code <= 65) return { text: "Rain", emoji: "🌧️" };
  if (code === 66 || code === 67) return { text: "Freezing rain", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { text: "Snow", emoji: "🌨️" };
  if (code >= 80 && code <= 82) return { text: "Rain showers", emoji: "🌦️" };
  if (code === 85 || code === 86) return { text: "Snow showers", emoji: "🌨️" };
  if (code >= 95) return { text: "Thunderstorm", emoji: "⛈️" };
  return { text: "Unknown weather", emoji: "🌡️" };
}

// Is it raining right now? (drizzle, rain, showers, thunderstorm)
function isRainCode(code) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
}

// Is it snowing right now?
function isSnowCode(code) {
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

// ---------- 3. Outfit rules (from the "Outfit rules" section of PRD.md) ----------
// The text follows the browser's language. Add more languages by copying a block below.
// Languages not listed here fall back to English.
const userLang = (navigator.language || "en").slice(0, 2).toLowerCase();
const TEXT = {
  en: { title: "What to wear", heavy: "Heavy coat, hat and gloves", warm: "Warm jacket", light: "Light jacket or sweater", tshirt: "T-shirt weather", shorts: "Shorts, sunscreen and water", umbrella: "Umbrella", boots: "Waterproof boots", wind: "Windbreaker" },
  hi: { title: "क्या पहनें", heavy: "भारी कोट, टोपी और दस्ताने", warm: "गर्म जैकेट", light: "हल्की जैकेट या स्वेटर", tshirt: "टी-शर्ट का मौसम", shorts: "शॉर्ट्स, सनस्क्रीन और पानी", umbrella: "छाता", boots: "वाटरप्रूफ बूट", wind: "विंडचीटर" },
  es: { title: "Qué ponerse", heavy: "Abrigo grueso, gorro y guantes", warm: "Chaqueta de abrigo", light: "Chaqueta ligera o suéter", tshirt: "Tiempo de camiseta", shorts: "Pantalones cortos, protector solar y agua", umbrella: "Paraguas", boots: "Botas impermeables", wind: "Cortavientos" },
  fr: { title: "Que porter", heavy: "Manteau épais, bonnet et gants", warm: "Veste chaude", light: "Veste légère ou pull", tshirt: "Temps de t-shirt", shorts: "Short, crème solaire et eau", umbrella: "Parapluie", boots: "Bottes imperméables", wind: "Coupe-vent" },
  de: { title: "Was anziehen", heavy: "Dicker Mantel, Mütze und Handschuhe", warm: "Warme Jacke", light: "Leichte Jacke oder Pullover", tshirt: "T-Shirt-Wetter", shorts: "Shorts, Sonnencreme und Wasser", umbrella: "Regenschirm", boots: "Wasserdichte Stiefel", wind: "Windjacke" },
  pt: { title: "O que vestir", heavy: "Casaco grosso, gorro e luvas", warm: "Jaqueta quente", light: "Jaqueta leve ou suéter", tshirt: "Clima de camiseta", shorts: "Bermuda, protetor solar e água", umbrella: "Guarda-chuva", boots: "Botas impermeáveis", wind: "Corta-vento" }
};
// Get one phrase in the person's language (English if missing)
function L(key) {
  return (TEXT[userLang] || TEXT.en)[key];
}

// Always uses °C and km/h.
function getOutfitAdvice(feelsLike, rainChance, isRaining, isSnowing, windKmh) {
  const advice = [];
  const t = Math.round(feelsLike); // whole number so every value fits one band

  if (t <= 0) advice.push("🧥 " + L("heavy"));
  else if (t <= 10) advice.push("🧥 " + L("warm"));
  else if (t <= 18) advice.push("🧶 " + L("light"));
  else if (t <= 26) advice.push("👕 " + L("tshirt"));
  else advice.push("🩳 " + L("shorts"));

  if (isSnowing) advice.push("🥾 " + L("boots"));
  else if (isRaining || rainChance >= 50) advice.push("☔ " + L("umbrella"));

  if (windKmh >= 30) advice.push("💨 " + L("wind"));
  return advice;
}

// Decide the sky label, emoji and background: clear, cloudy, dusty, windy, rainy (plus snowy, foggy)
function getSky(code, windKmh, dust, raining, snowing) {
  const base = describeWeather(code);
  if (raining) return { key: "rainy", text: base.text, emoji: base.emoji };
  if (snowing) return { key: "snowy", text: base.text, emoji: base.emoji };
  if (dust >= 100) return { key: "dusty", text: "Dusty", emoji: "🏜️" };
  if (code === 45 || code === 48) return { key: "foggy", text: base.text, emoji: base.emoji };
  if (windKmh >= 30) return { key: "windy", text: "Windy", emoji: "💨" };
  if (code === 2 || code === 3) return { key: "cloudy", text: base.text, emoji: base.emoji };
  return { key: "clear", text: base.text, emoji: base.emoji };
}

// ---------- 4. Talk to Open-Meteo ----------
// Step A: turn a city name into latitude and longitude.
async function findCity(name) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
    encodeURIComponent(name);
  const response = await fetch(url);
  if (!response.ok) throw new Error("geocoding failed");
  const data = await response.json();

  // No "results" means the city was not found.
  if (!data.results || data.results.length === 0) return null;
  return data.results[0];
}

// Step B: get the weather for that latitude and longitude.
async function getWeather(latitude, longitude) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + latitude +
    "&longitude=" + longitude +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,snowfall" +
    "&daily=precipitation_probability_max" +
    "&wind_speed_unit=kmh&forecast_days=1&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) throw new Error("forecast failed");
  return response.json();
}

// ---------- 5. Show things on the page ----------
function showMessage(text) {
  messageBox.textContent = text;
  messageBox.hidden = false;
  resultBox.hidden = true;
}

// Dust level (µg/m³) from Open-Meteo's air quality service. If it fails we simply assume 0.
async function getDust(latitude, longitude) {
  try {
    const url = "https://air-quality-api.open-meteo.com/v1/air-quality?current=dust&latitude=" + latitude + "&longitude=" + longitude;
    const data = await (await fetch(url)).json();
    return data.current.dust || 0;
  } catch (error) {
    return 0;
  }
}

function showWeather(city, weather, dust) {
  const now = weather.current;
  const rainChance = weather.daily.precipitation_probability_max[0] || 0;

  const snowing = isSnowCode(now.weather_code) || now.snowfall > 0;
  const raining = isRainCode(now.weather_code) || (now.precipitation > 0 && !snowing);
  const sky = getSky(now.weather_code, now.wind_speed_10m, dust, raining, snowing);

  document.body.className = "bg-" + sky.key; // changes the background

  cityNameEl.textContent = city.name + (city.country ? ", " + city.country : "");
  emojiEl.textContent = sky.emoji;
  descriptionEl.textContent = sky.text;
  temperatureEl.textContent = Math.round(now.temperature_2m) + "°C";
  feelsLikeEl.textContent = "Feels like " + Math.round(now.apparent_temperature) + "°C";

  // Outfit advice in the person's language
  outfitTitle.textContent = L("title");
  const advice = getOutfitAdvice(now.apparent_temperature, rainChance, raining, snowing, now.wind_speed_10m);
  outfitList.innerHTML = "";
  advice.forEach(function (line) {
    const item = document.createElement("li");
    item.textContent = line;
    outfitList.appendChild(item);
  });

  messageBox.hidden = true;
  resultBox.hidden = false;
}

// ---------- 7. Live local time, e.g. "4:30 PM IST – India Standard Time" ----------
function zoneName(date, timeZone, style) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timeZone, timeZoneName: style }).formatToParts(date);
  return parts.find(function (p) { return p.type === "timeZoneName"; }).value;
}

function startClock(timeZone, apiAbbreviation) {
  clearInterval(clockTimer);
  function tick() {
    const now = new Date();
    const time = new Intl.DateTimeFormat("en-US", { timeZone: timeZone, hour: "numeric", minute: "2-digit" }).format(now);
    // Prefer short names like IST; otherwise use what the browser gives
    const short = /^[A-Z]{2,5}$/.test(apiAbbreviation) ? apiAbbreviation : zoneName(now, timeZone, "short");
    clockEl.textContent = time + " " + short + " – " + zoneName(now, timeZone, "long");
  }
  tick();
  clockTimer = setInterval(tick, 1000); // check every second so the minute changes on time
}

// ---------- 8. Local currency and USD rate (refreshes every 30 minutes) ----------
// Currency of the country: restcountries.com. USD rates: open.er-api.com. Both are free, no key.
async function loadCurrency(countryCode, id) {
  clearInterval(rateTimer);
  currencyEl.textContent = "Loading...";
  try {
    let data = await (await fetch("https://restcountries.com/v3.1/alpha/" + countryCode + "?fields=currencies")).json();
    if (Array.isArray(data)) data = data[0];
    const code = Object.keys(data.currencies)[0]; // first currency if a country has several
    const symbol = data.currencies[code].symbol || "";
    const name = data.currencies[code].name;

    async function refresh() {
      const rates = (await (await fetch("https://open.er-api.com/v6/latest/USD")).json()).rates;
      if (id !== searchId) return; // a newer search replaced this one
      const rate = rates[code].toLocaleString(undefined, { maximumFractionDigits: rates[code] < 1 ? 4 : 2 });
      const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      currencyEl.textContent = code + " (" + symbol + ") – " + name + ". 1 USD = " + symbol + rate + " (checked " + time + ")";
    }
    await refresh();
    rateTimer = setInterval(function () { refresh().catch(function () {}); }, 30 * 60 * 1000);
  } catch (error) {
    if (id === searchId) currencyEl.textContent = "Currency details aren't available right now.";
  }
}

// ---------- 9. Up to 5 places to visit (Wikipedia: nearby articles, most-read first) ----------
async function loadPlaces(latitude, longitude, id) {
  placesList.innerHTML = "";
  try {
    const api = "https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&";
    // Step A: articles within 10 km, with how many times each was read in the last 30 days
    const nearby = await (await fetch(api + "generator=geosearch&ggslimit=50&ggsradius=10000&ggscoord=" +
      latitude + "%7C" + longitude + "&prop=pageviews%7Cdescription&pvipdays=30")).json();
    const pages = Object.values(nearby.query.pages);
    const reads = function (p) { return Object.values(p.pageviews || {}).reduce(function (a, b) { return a + (b || 0); }, 0); };

    // Prefer things that look like attractions, then fill up with the rest
    const looksLikeSight = /museum|castle|palace|temple|church|cathedral|park|tower|bridge|monument|square|fort|garden|market|gallery|mosque|beach|lake|zoo|memorial|theatre|landmark|historic|shrine|gate|statue|basilica|abbey|mausoleum|waterfall|viewpoint|opera/i;
    const byReads = function (a, b) { return reads(b) - reads(a); };
    const sights = pages.filter(function (p) { return looksLikeSight.test(p.description || ""); }).sort(byReads);
    const others = pages.filter(function (p) { return !looksLikeSight.test(p.description || ""); }).sort(byReads);
    const top = sights.concat(others).slice(0, 5);

    // Step B: a short description for each
    const ids = top.map(function (p) { return p.pageid; }).join("|");
    const info = await (await fetch(api + "prop=extracts&exintro=1&explaintext=1&exsentences=2&exlimit=max&pageids=" + encodeURIComponent(ids))).json();

    if (id !== searchId) return;
    top.forEach(function (p) {
      let text = (info.query.pages[p.pageid].extract || p.description || "").replace(/\s+/g, " ");
      if (text.length > 220) text = text.slice(0, 217) + "...";
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = p.title;
      const desc = document.createElement("span");
      desc.textContent = text;
      item.appendChild(title);
      item.appendChild(desc);
      placesList.appendChild(item);
    });
    if (top.length === 0) throw new Error("none");
  } catch (error) {
    if (id === searchId) placesList.innerHTML = "<li>We couldn't find places to visit right now.</li>";
  }
}

// ---------- 6. What happens when the person searches ----------
form.addEventListener("submit", async function (event) {
  event.preventDefault(); // stop the page from reloading

  const name = cityInput.value.trim();
  if (name === "") {
    showMessage("Please type a city name first.");
    return;
  }

  const id = ++searchId;
  searchButton.disabled = true;
  searchButton.textContent = "Searching...";

  try {
    const city = await findCity(name);
    if (city === null) {
      showMessage("We couldn't find \"" + name + "\". Check the spelling or try a nearby big city.");
      return;
    }
    const results = await Promise.all([getWeather(city.latitude, city.longitude), getDust(city.latitude, city.longitude)]);
    showWeather(city, results[0], results[1]);
    startClock(results[0].timezone, results[0].timezone_abbreviation);
    // Extras load on their own, so a problem in one never hides the weather
    loadCurrency(city.country_code, id);
    loadPlaces(city.latitude, city.longitude, id);
  } catch (error) {
    showMessage("We couldn't get the weather. Check your internet connection and try again.");
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});
