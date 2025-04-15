const API_KEY = "554a3e5e4f1541df84952040251404";

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        getForecast(`${lat},${lon}`);
      },
      (err) => {
        console.warn("GPS failed, using default.");
        getForecast("San Antonio");
      }
    );
  } else {
    console.warn("Geolocation not supported, using default.");
    getForecast("San Antonio");
  }
}

async function getForecast(location) {
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3`);
  const data = await res.json();
  const forecast = data.forecast.forecastday;

  let outputHTML = "";

  for (let i = 0; i < forecast.length; i++) {
    const day = forecast[i];
    const date = day.date;

    outputHTML += `<div class="forecast-day"><h3>${date}</h3>`;

    for (let h = 6; h <= 20; h += 2) {
      const hourData = day.hour[h];
      const pressure = hourData.pressure_mb;
      const wind = hourData.wind_mph;
      const temp = hourData.temp_f;
      const sky = hourData.condition.text;
      const moon = day.astro.moon_phase;

      const bite = calculateBiteRating(pressure, 0, moon, wind, temp, 0, sky);

      outputHTML += `
        <div class="hour-slot">
          <strong>${hourData.time.split(" ")[1]}</strong><br>
          🐟 <b>${bite}/10</b> • ${sky}<br>
          💨 ${wind} mph • 🌡️ ${temp}°F • 📈 ${pressure} mb
        </div>
      `;
    }

    outputHTML += `</div>`;
  }

  document.getElementById("output").innerHTML = outputHTML;
}

function calculateBiteRating(pressure, pressureTrend, moon, wind, temp, tempTrend, sky) {
  let score = 0;
  if (pressure > 1010) score += 1;
  if (moon === "Full Moon" || moon === "New Moon") score += 2;
  else if (moon.includes("Gibbous")) score += 1;
  if (wind >= 6 && wind <= 15) score += 2;
  if (temp >= 66 && temp <= 78) score += 2;
  if (sky.includes("Cloudy") && wind >= 6) score += 1;
  return Math.max(1, Math.min(score, 10));
}

window.onload = getUserLocation;
