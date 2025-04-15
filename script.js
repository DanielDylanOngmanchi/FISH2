const API_KEY = "cda30cf4-198c-11f0-95f7-0242ac130003-cda30d4e-198c-11f0-95f7-0242ac130003";
const LAT = 29.4241;
const LNG = -98.4936;

async function getForecast() {
  try {
    const res = await fetch(`https://api.stormglass.io/v2/weather/point?lat=${LAT}&lng=${LNG}&params=airTemperature,cloudCover,windSpeed,pressure,moonPhase`, {
      headers: { 'Authorization': API_KEY }
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const hours = data.hours.slice(0, 24);

    const avg = (key) =>
      hours.map((h) => h[key]?.sg || 0).reduce((a, b) => a + b, 0) / hours.length;

    const pressure = avg("pressure");
    const airTemp = avg("airTemperature");
    const wind = avg("windSpeed");
    const clouds = avg("cloudCover");
    const moon = hours[0].moonPhase?.sg || 0;

    const score = calculateBiteScore({ pressure, airTemp, wind, clouds, moon });
    const mood = getFishingStyle(score);

    document.getElementById("output").innerHTML = `
      <div class="forecast-day">
        <h2>🎣 Today's Bite Forecast</h2>
        <p>🐟 Bite Rating: <strong>${score.toFixed(1)}/10</strong></p>
        <p>🎣 Style: ${mood.label} ${mood.emoji}</p>
        <p>🌕 Moon Illumination: ${(moon * 100).toFixed(0)}%</p>
        <p>🌡️ Air Temp: ${airTemp.toFixed(1)} °C</p>
        <p>📈 Pressure: ${pressure.toFixed(1)} hPa</p>
        <p>💨 Wind: ${wind.toFixed(1)} m/s</p>
        <p>☁️ Cloud Cover: ${clouds.toFixed(1)}%</p>
      </div>
    `;
  } catch (err) {
    console.error("⚠️ Storm Glass API call failed:", err);
    alert("⚠️ Error loading forecast:\n" + err.message);
    document.getElementById("output").innerHTML = `
      <div class="forecast-day">
        <h2>⚠️ Unable to load forecast</h2>
        <p>${err.message}</p>
        <p>Make sure your API key is valid and you haven't hit your free usage limit.</p>
      </div>
    `;
  }
}

function calculateBiteScore({ pressure, airTemp, wind, clouds, moon }) {
  let score = 0;

  if (pressure >= 1010 && pressure <= 1020) score += 2;
  else if (pressure < 1005) score += 1;
  else score -= 1;

  if (moon <= 0.1 || moon >= 0.9) score += 2.5;
  else if (moon >= 0.4 && moon <= 0.6) score -= 1;

  if (wind >= 3 && wind <= 7) score += 2;
  else if (wind < 2) score -= 0.5;

  if (clouds >= 30 && clouds <= 70) score += 1;
  else if (clouds < 20) score -= 0.5;

  if (airTemp >= 16 && airTemp <= 27) score += 1;

  return curveScore(score);
}

function curveScore(score) {
  if (score >= 9.5) return 9.5 + Math.random() * 0.5;
  if (score >= 8.5) return 8.5 + Math.random();
  if (score >= 7) return 7 + Math.random();
  if (score >= 5) return 5 + Math.random() * 1.5;
  if (score >= 3) return 3 + Math.random() * 1.2;
  return 1 + Math.random() * 1.5;
}

function getFishingStyle(score) {
  if (score <= 3) return { label: "Finesse", emoji: "🐌" };
  if (score <= 6) return { label: "Mixed", emoji: "⚖️" };
  return { label: "Power", emoji: "⚡" };
}

window.onload = getForecast;
