const API_KEY = "554a3e5e4f1541df84952040251404";

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        reverseLookup(lat, lon);
      },
      () => {
        updateLocationDisplay("📍 Using default location (San Antonio)");
        getForecast("San Antonio");
      }
    );
  } else {
    updateLocationDisplay("📍 Using default location (San Antonio)");
    getForecast("San Antonio");
  }
}

function updateLocationDisplay(label) {
  document.querySelector("h1").innerHTML = `🎣 Fish Forecast<br><span style="font-size: 1rem; font-weight: normal;">${label}</span>`;
}

async function reverseLookup(lat, lon) {
  const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`);
  const data = await res.json();
  const locationName = `${data.location.name}, ${data.location.region}`;
  updateLocationDisplay(`📍 ${locationName}`);
  getForecast(`${lat},${lon}`);
}

async function getForecast(location) {
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=10`);
  const data = await res.json();
  const forecast = data.forecast.forecastday;

  let outputHTML = "";

  // 3-Day Hourly Forecast (full 24 hours)
  for (let i = 0; i < 3; i++) {
    const day = forecast[i];
    const date = day.date;
    const moon = day.astro.moon_phase;

    outputHTML += `<div class="forecast-day"><h3>${date} (Hourly)</h3><div class="hour-container">`;

    for (let h = 0; h < 24; h++) {
      const hour = day.hour[h];
      const pressureMB = hour.pressure_mb;
      const pressureINHG = (pressureMB / 33.8639).toFixed(2);
      const wind = hour.wind_mph;
      const temp = hour.temp_f;
      const sky = hour.condition.text;

      const bite = calculateBiteRating(pressureMB, 0, moon, wind, temp, 0, sky);

      outputHTML += `
        <div class="hour-slot ${bite >= 4.5 ? "hot" : bite >= 3 ? "mid" : "cold"}">
          <strong>${hour.time.split(" ")[1]}</strong><br>
          <b>${bite.toFixed(1)}/5</b><br>${sky}<br>
          💨 ${wind} mph<br>🌡️ ${temp}°F<br>📈 ${pressureINHG} inHg
        </div>
      `;
    }

    outputHTML += `</div></div>`;
  }

  // 7-Day Daily Forecast
  for (let i = 3; i < forecast.length; i++) {
    const day = forecast[i];
    const date = day.date;
    const moon = day.astro.moon_phase;
    const wind = day.day.maxwind_mph;
    const temp = day.day.avgtemp_f;
    const sky = day.day.condition.text;
    const pressureMB = day.hour[12].pressure_mb;
    const pressureINHG = (pressureMB / 33.8639).toFixed(2);

    const bite = calculateBiteRating(pressureMB, 0, moon, wind, temp, 0, sky);

    outputHTML += `
      <div class="forecast-day ${bite >= 4.5 ? "hot" : bite >= 3 ? "mid" : "cold"}">
        <h3>${date} (Daily)</h3>
        <p>🐟 Bite Rating: <strong>${bite.toFixed(1)}/5</strong></p>
        <p>🌕 Moon Phase: ${moon}</p>
        <p>💨 Wind: ${wind} mph</p>
        <p>🌡️ Temp: ${temp}°F</p>
        <p>☁️ Sky: ${sky}</p>
        <p>📈 Pressure: ${pressureINHG} inHg</p>
      </div>
    `;
  }

  document.getElementById("output").innerHTML = outputHTML;
}

function calculateBiteRating(pressure, pressureTrend, moon, wind, temp, tempTrend, sky) {
  let score = 0;

  if (pressure > 1010) score += 1;
  if (moon === "Full Moon" || moon === "New Moon") score += 1;
  else if (moon.includes("Gibbous")) score += 0.5;
  if (wind >= 6 && wind <= 15) score += 1;
  if (temp >= 66 && temp <= 78) score += 1;
  if (sky.includes("Cloudy") && wind >= 6) score += 0.5;

  return Math.max(1, Math.min(score, 5));
}

window.onload = getUserLocation;
