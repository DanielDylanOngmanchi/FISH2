const API_KEY = "554a3e5e4f1541df84952040251404"; // your key
const LOCATION = "San Antonio";

async function getForecast() {
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${LOCATION}&days=10`);
  const data = await res.json();
  const forecast = data.forecast.forecastday;

  let outputHTML = "";

  for (let i = 0; i < forecast.length; i++) {
    const today = forecast[i];
    const yesterday = i > 0 ? forecast[i - 1] : null;

    const date = today.date;
    const pressure = today.hour[12].pressure_mb;
    const wind = today.day.maxwind_mph;
    const temp = today.day.avgtemp_f;
    const sky = today.day.condition.text;
    const moon = today.astro.moon_phase;

    const moonrise = today.astro.moonrise;
    const moonset = today.astro.moonset;

    // Feeding times
    const major1 = addHoursToTime(moonrise, 6);
    const major2 = addHoursToTime(moonset, 6);

    // Calculate pressure/temp trends
    const pressureTrend = yesterday ? pressure - yesterday.hour[12].pressure_mb : 0;
    const tempTrend = yesterday ? temp - yesterday.day.avgtemp_f : 0;

    const biteRating = calculateBiteRating(pressure, pressureTrend, moon, wind, temp, tempTrend, sky);

    outputHTML += `
      <div class="forecast-day">
        <h3>${date}</h3>
        <p>🐟 Bite Rating: <strong>${biteRating}/10</strong></p>
        <p>🌕 Moon Phase: ${moon}</p>
        <p>🎯 Major Feeding: ${major1}, ${major2}</p>
        <p>🔹 Minor Feeding: ${moonrise}, ${moonset}</p>
        <p>📈 Pressure: ${pressure} mb (${pressureTrend >= 1 ? "Rising" : pressureTrend <= -1 ? "Falling" : "Steady"})</p>
        <p>🌡️ Temp: ${temp}°F (${tempTrend >= 1 ? "Warming" : tempTrend <= -1 ? "Cooling" : "Stable"})</p>
        <p>💨 Wind: ${wind} mph</p>
        <p>⛅ Sky: ${sky}</p>
      </div>
    `;
  }

  document.getElementById("output").innerHTML = outputHTML;
}

function calculateBiteRating(pressure, pressureTrend, moon, wind, temp, tempTrend, sky) {
  let score = 0;

  // Pressure trend
  if (pressureTrend > 1) score += 4;
  else if (pressureTrend >= 0.5) score += 2;
  else if (pressureTrend < -1) score -= 1;

  // Moon phase
  if (moon === "Full Moon" || moon === "New Moon") score += 3;
  else if (moon.includes("Gibbous")) score += 1;

  // Wind sweet zone
  if (wind >= 6 && wind <= 15) score += 2;

  // Temp zone + trend simulation (with water lag)
  if (temp >= 66 && temp <= 78) score += 1;
  if (tempTrend > 1) score += 2; // warming water = good
  if (tempTrend < -1) score -= 1; // cold snap = bad

  // Sky conditions
  if (sky.includes("Cloudy") && wind >= 6) score += 1;

  return Math.max(1, Math.min(score, 10)); // clamp between 1–10
}

function addHoursToTime(timeStr, hoursToAdd) {
  if (!timeStr || timeStr === "No moonrise" || timeStr === "No moonset") return "N/A";

  const [hourMin, ampm] = timeStr.split(' ');
  let [hour, min] = hourMin.split(':').map(Number);

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  const date = new Date();
  date.setHours(hour + hoursToAdd, min);

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

window.onload = getForecast;
