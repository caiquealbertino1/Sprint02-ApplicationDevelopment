import { flyToLocation } from "./map.js";

let loadedCount = 0;
const TOTAL = 10;

/**
 * Clears skeleton loaders and prepares the point list for real cards.
 */
export function initDashboard() {
    const list = document.getElementById("point-list");
    list.innerHTML = "";
}

/**
 * Appends a weather card for a location to the sidebar.
 * @param {{ id: number, name: string, type: string, lat: number, lon: number }} location
 * @param {{ temperature: number, windspeed: number, label: string, icon: string,
 *           precipProb: number|null, humidity: number|null, risk: string }} weather
 * @param {number} delay - Animation stagger delay in ms
 */
export function renderCard(location, weather, delay = 0) {
    const list = document.getElementById("point-list");

    const precipHtml = weather.precipProb !== null
        ? `<div class="metric">
               <span class="metric-val ${precipColor(weather.precipProb)}">${weather.precipProb}%</span>
               <span class="metric-key">Prob. Chuva</span>
           </div>`
        : "";

    const humidHtml = weather.humidity !== null
        ? `<div class="metric">
               <span class="metric-val">${weather.humidity}%</span>
               <span class="metric-key">Humidade</span>
           </div>`
        : "";

    const card = document.createElement("div");
    card.className = `point-card risk-${weather.risk}`;
    card.style.animationDelay = `${delay}ms`;
    card.dataset.locationId = location.id;

    card.innerHTML = `
        <div class="card-header">
            <span class="card-name">${location.name}</span>
            <span class="card-id">#${String(location.id).padStart(2, "0")}</span>
        </div>
        <div class="card-coords">${location.lat.toFixed(4)}, ${location.lon.toFixed(4)} · ${location.type}</div>
        <div class="card-metrics">
            <div class="metric">
                <span class="metric-val ${tempColor(weather.temperature)}">${weather.temperature}°C</span>
                <span class="metric-key">Temperatura</span>
            </div>
            <div class="metric">
                <span class="metric-val ${windColor(weather.windspeed)}">${weather.windspeed} km/h</span>
                <span class="metric-key">Vento</span>
            </div>
            ${precipHtml || humidHtml}
        </div>
        <div class="card-condition">
            <span class="condition-icon">${weather.icon}</span>
            <span>${weather.label}</span>
        </div>
    `;

    card.addEventListener("click", () => flyToLocation(location.id));

    list.appendChild(card);
}

/**
 * Appends an error card when weather fetch fails for a location.
 * @param {{ id: number, name: string }} location
 */
export function renderErrorCard(location) {
    const list = document.getElementById("point-list");
    const card = document.createElement("div");
    card.className = "error-card";
    card.textContent = `#${location.id} ${location.name} — erro ao carregar dados`;
    list.appendChild(card);
}

/**
 * Updates the three summary stat boxes at the top of the sidebar.
 * @param {Array<object>} weatherResults - Array of weather objects
 */
export function updateStats(weatherResults) {
    const valid = weatherResults.filter(Boolean);
    if (!valid.length) return;

    const avgTemp  = (valid.reduce((s, w) => s + w.temperature, 0) / valid.length).toFixed(1);
    const maxWind  = Math.max(...valid.map(w => w.windspeed));
    const highRisk = valid.filter(w => w.risk === "high").length;

    document.getElementById("stat-avg-temp").textContent = `${avgTemp}°C`;
    document.getElementById("stat-max-wind").textContent = `${maxWind} km/h`;
    document.getElementById("stat-high-risk").textContent = `${highRisk}`;

    // Color the high-risk count if it's alarming
    const riskEl = document.getElementById("stat-high-risk");
    if (highRisk >= 3)      riskEl.style.color = "var(--red)";
    else if (highRisk >= 1) riskEl.style.color = "var(--amber)";
}

/**
 * Updates the loaded point counter in the sidebar header.
 * @param {number} count
 */
export function updatePointCount(count) {
    document.getElementById("point-count").textContent = `${count} / ${TOTAL}`;
}

/**
 * Sets the status badge state.
 * @param {"loading"|"done"|"error"} state
 * @param {string} [text]
 */
export function setStatusBadge(state, text) {
    const badge = document.getElementById("status-badge");
    badge.className = `badge ${state}`;
    const labels = {
        loading: "● Carregando…",
        done:    "● Online",
        error:   "● Erro parcial",
    };
    badge.textContent = text || labels[state];
}

export function updateTimestamp() {
    const el = document.getElementById("last-update");
    const now = new Date();
    el.textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function tempColor(t) {
    if (t >= 35) return "red";
    if (t >= 28) return "amber";
    return "";
}

function windColor(w) {
    if (w >= 40) return "red";
    if (w >= 25) return "amber";
    return "";
}

function precipColor(p) {
    if (p <= 10) return "red";
    if (p <= 30) return "amber";
    return "";
}
